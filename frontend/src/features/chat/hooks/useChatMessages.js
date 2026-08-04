import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../utils/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function useChatMessages({
  user,
  activeTripId,
  realTrips,
  tripData,
  tripDataRef,
  setTripData,
  updateTripState,
  setMessages,
  getItinerary,
  setItinerary,
  itineraryCache,
  saveItineraryToCache,
  updateAiItinerary,
  aiItineraryCache,
  activePlanView,
  setIsGenerating,
  userName,
  enhanceItineraryWithImages,
  loading
}) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Auto-scroll chat to bottom ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tripData, activeTripId]);

  // ── Fetch messages for a trip ──────────────────────────────────────────────
  const fetchMessages = async (tripId) => {
    if (!user || !tripId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const sortedData = (data || []).reverse();
      let recoveredItinerary = null;

      const messages = sortedData.flatMap(msg => {
        const from = msg.role === 'user' ? 'user' : 'bot';
        let text = msg.content;
        let hadItinerary = false;

        if (from === "bot") {
          try {
            let raw = text.match(/\[ITINERARY\]([\s\S]*?)\[\/ITINERARY\]/i)?.[1] ||
              text.match(/\{[\s\S]*"days"[\s\S]*\}/i)?.[0];

            if (raw) {
              raw = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
              const fb = raw.indexOf('{');
              const lb = raw.lastIndexOf('}');
              if (fb !== -1 && lb !== -1 && lb > fb) {
                raw = raw.slice(fb, lb + 1).replace(/,\s*([\]}])/g, '$1');
              }
              const parsed = JSON.parse(raw);
              if (parsed && parsed.days) {
                recoveredItinerary = parsed;
                hadItinerary = true;
              }
            }
          } catch (e) { }

          text = text
            .replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, "")
            .replace(/```(?:json)?[\s\S]*?```/gi, "")
            .replace(/\[[\w\s]+Itinerary\][\s\S]*?(\{[\s\S]*\})/gi, "")
            .replace(/\{[\s\S]*"days"[\s\S]*\}/gi, "")
            .trim();

          const paragraphs = text ? text.split(/\n\n+/).map(p => p.trim()).filter(Boolean) : [];
          const botMessages = paragraphs.map((p, idx) => ({
            id: `${msg.id}-${idx}`,
            from,
            text: p,
            createdAt: msg.created_at
          }));

          if (hadItinerary) {
            botMessages.push({
              id: `${msg.id}-itin`,
              from,
              text: "✨ **Your plan is ready!** I've created a copy in 'Your Plan' that you can now fully customize in the Planner. Feel free to add, remove, or move things around! 🗺️",
              createdAt: msg.created_at
            });
          }

          if (botMessages.length > 0) {
            return botMessages;
          }
        }

        return [{ id: msg.id, from, text, createdAt: msg.created_at }];
      });

      if (recoveredItinerary) {
        try {
          recoveredItinerary = await enhanceItineraryWithImages(recoveredItinerary);
        } catch (e) { console.error("Recovery Image Enhancement failed", e); }
      }

      setTripData((prev) => ({
        ...prev,
        [tripId]: {
          ...prev[tripId],
          messages: messages,
          itinerary: (itineraryCache || {})[tripId] || recoveredItinerary || prev[tripId]?.itinerary,
          messagesFetched: true,
        },
      }));

      if (recoveredItinerary && !(itineraryCache || {})[tripId]) {
        saveItineraryToCache(tripId, recoveredItinerary);
      }
    } catch (err) {
      console.error("fetchMessages error:", err);
      setTripData((prev) => ({
        ...prev,
        [tripId]: { ...prev[tripId], messages: [], messagesFetched: true },
      }));
    }
  };

  useEffect(() => {
    if (activeTripId) {
      const current = tripData[activeTripId];
      if (!current?.messagesFetched) {
        fetchMessages(activeTripId);
      }
    }
  }, [activeTripId, loading]);

  // ── Send a message (user-typed or auto) ───────────────────────────────────
  const sendMessage = async (text, tripId = activeTripId, forcedStage = null) => {
    if (!text?.trim() || !tripId) return;

    const userMessage = { id: Date.now(), from: "user", text };
    const currentTrip = tripDataRef.current[tripId] || {};
    let currentStage = forcedStage || currentTrip.aiStage;
    const collected = currentTrip.collected || {};

    if (text.toLowerCase().includes("plan a") && text.toLowerCase().includes("day trip")) {
      currentStage = "GENERATING";
    }

    setMessages(tripId, (prev) => [...prev, userMessage]);
    setIsSending(true);
    setIsGenerating(true);

    if (!currentStage) {
      const hasMessages = currentTrip.messages?.length > 0;

      if (hasMessages) {
        currentStage = "CHAT";
      } else {
        updateTripState(tripId, {
          aiStage: "ASK_DESTINATION",
          collected: {},
        });

        const botMessage = {
          id: Date.now() + 1,
          from: "bot",
          text: `Hey ${userName}! Where do you wanna go? 🌍`,
          options: ["Beach 🏖️", "Mountains ⛰️", "City 🏙️"],
        };

        setMessages(tripId, (prev) => [...prev, botMessage]);
        setIsSending(false);
        setIsGenerating(false);
        return;
      }
    }

    let botReply = null;
    let nextStage = currentStage;
    let updatedCollected = { ...collected };
    let finalPrompt = null;

    if (currentStage === "ASK_DESTINATION" && !collected.destination) {
      let destination = text;
      if (text.toLowerCase().includes("surprise")) {
        const randomPlaces = ["Bali", "Paris", "Tokyo", "Istanbul", "Santorini", "Kyoto", "New York", "Dubai"];
        destination = randomPlaces[Math.floor(Math.random() * randomPlaces.length)];
        setMessages(tripId, (prev) => [
          ...prev,
          { id: Date.now() + 0.5, from: "bot", text: `How about ${destination}? It's a vibe! ✨` }
        ]);
      }
      updatedCollected.destination = destination;
      nextStage = "ASK_DAYS";
      botReply = {
        text: `Nice choice, ${userName}! ${destination} is amazing. 🌍 How many days are you planning to stay?`,
        options: ["3", "5", "7", "10"],
      };
    } else if (currentStage === "ASK_DAYS" && !collected.days) {
      let days = text;
      if (text.toLowerCase().includes("surprise")) {
        days = ["3", "5", "7", "10"][Math.floor(Math.random() * 4)];
        setMessages(tripId, (prev) => [
          ...prev,
          { id: Date.now() + 0.5, from: "bot", text: `Let's go with ${days} days! Perfect for a solid experience. ⏳` }
        ]);
      }
      updatedCollected.days = days;
      nextStage = "ASK_BUDGET";
      botReply = {
        text: "And what's the budget looking like? 💸",
        options: ["Budget 💸", "Moderate 💳", "Luxury 💎"],
      };
    } else if (currentStage === "ASK_BUDGET" && !collected.budget) {
      let budget = text;
      if (text.toLowerCase().includes("surprise")) {
        budget = "Moderate";
        setMessages(tripId, (prev) => [
          ...prev,
          { id: Date.now() + 0.5, from: "bot", text: "Planning with a Moderate budget for a balanced experience! 💳" }
        ]);
      }
      updatedCollected.budget = budget;
      nextStage = "GENERATING";

      updateTripState(tripId, {
        aiStage: "GENERATING",
        collected: updatedCollected,
      });

      const { destination, days, budget: finalBudget } = updatedCollected;
      finalPrompt = `Plan a ${days} day trip to ${destination} with ${finalBudget} budget. Mention it's for ${userName}.`;
      botReply = {
        text: `Got it, ${userName}! Building your perfect ${days}-day ${destination} itinerary... ✨`,
      };
    }

    if (botReply && nextStage !== "GENERATING" && nextStage !== "CHAT") {
      updateTripState(tripId, {
        aiStage: nextStage,
        collected: updatedCollected,
      });

      setMessages(tripId, (prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: botReply.text,
          options: botReply.options,
        },
      ]);

      setIsSending(false);
      setIsGenerating(false);
      return;
    }

    try {
      await supabase.from('messages').insert({
        trip_id: tripId,
        user_id: user.id,
        content: text,
        role: 'user'
      });
    } catch (e) { console.error("User message save failed", e); }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId: tripId,
          content: finalPrompt || text,
          destination: currentTrip?.collected?.destination || realTrips?.find(t => t.id === tripId)?.destination || "Unknown",
          allowModification: activePlanView === "user",
          currentItinerary: activePlanView === "user" ? getItinerary() : null,
          origin: currentTrip?.collected?.origin || null,
          arrivalStation: currentTrip?.collected?.arrivalStation || null,
          hotelAddress: currentTrip?.collected?.hotelAddress || null,
          history: (currentTrip?.messages || []).map(m => ({
            role: m.from === "bot" ? "assistant" : "user",
            content: m.text
          }))
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "";

      try {
        await supabase.from('messages').insert({
          trip_id: tripId,
          user_id: user.id,
          content: reply,
          role: 'assistant'
        });
      } catch (e) { console.error("Bot message save failed", e); }

      let parsedItinerary = null;
      let cleanReply = reply;

      try {
        const itinMatch = reply.match(/\[ITINERARY\]([\s\S]*?)\[\/ITINERARY\]/i);

        if (itinMatch) {
          let jsonString = itinMatch[1].replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
          const f = jsonString.indexOf('{');
          const l = jsonString.lastIndexOf('}');
          if (f !== -1 && l !== -1 && l > f) {
            jsonString = jsonString.slice(f, l + 1);
          }
          jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
          const raw = JSON.parse(jsonString);
          if (raw && raw.days) {
            parsedItinerary = await enhanceItineraryWithImages(raw);
          }
          cleanReply = reply.replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, "").replace(/```(?:json)?[\s\S]*?```/gi, "").trim();
        } else {
          let noBlocks = reply.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
          const first = noBlocks.indexOf("{");
          const last = noBlocks.lastIndexOf("}");
          if (first !== -1 && last !== -1 && last > first) {
            let jsonString = noBlocks.slice(first, last + 1).replace(/,\s*([\]}])/g, '$1');
            try {
              const raw = JSON.parse(jsonString);
              if (raw && raw.days) {
                parsedItinerary = await enhanceItineraryWithImages(raw);
                cleanReply = reply.replace(/```(?:json)?[\s\S]*?```/gi, "").replace(/\{[\s\S]*"days"[\s\S]*\}/gi, "").trim();
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Payload parse error:", err);
      }

      if (!parsedItinerary) {
        if (cleanReply.length > 500 && cleanReply.includes("{") && cleanReply.includes("}")) {
          cleanReply = "I tried to generate your itinerary, but the format got a little corrupted along the way! Could you please ask me to try again?";
        }
      }

      if (cleanReply) {
        const paragraphs = cleanReply.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i];
          setMessages(tripId, (prev) => [
            ...prev,
            {
              id: Date.now() + i,
              from: "bot",
              text: p,
            }
          ]);

          if (i < paragraphs.length - 1 || parsedItinerary) {
            await new Promise(resolve => setTimeout(resolve, 2500));
          }
        }

        if (parsedItinerary) {
          setMessages(tripId, (prev) => [
            ...prev,
            {
              id: Date.now() + paragraphs.length,
              from: "bot",
              text: "✨ **Your plan is ready!** I've created a copy in 'Your Plan' that you can now fully customize in the Planner. Feel free to add, remove, or move things around! 🗺️",
            }
          ]);
        }
      }

      if (parsedItinerary) {
        setItinerary(tripId, parsedItinerary);
        const existingAiPlan = (aiItineraryCache || {})[tripId];
        if (!existingAiPlan) {
          updateAiItinerary(tripId, parsedItinerary);
        }
      }

      updateTripState(tripId, { aiStage: null });
    } catch (err) {
      console.error("sendMessage error:", err);
      setMessages(tripId, (prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          from: "bot",
          text: "I'm having trouble connecting to the travel engine. Please try again in a few seconds.",
        },
      ]);
    } finally {
      setIsSending(false);
      setIsGenerating(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  return {
    input,
    setInput,
    isSending,
    setIsSending,
    messagesEndRef,
    fetchMessages,
    sendMessage,
    handleSend
  };
}
