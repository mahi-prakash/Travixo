// src/pages/Bookings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/common/Card";
import { Plane, Hotel, Car, Calendar, Sparkles, Map, ArrowLeft, Star, MapPin, Search, ChevronDown, Clock, Bed, Ticket, Trash2 } from "lucide-react";
import SEO from "../components/common/SEO";

import { useTrip } from "../context/TripContext";
import { api } from "../services/api";

const ICON_MAP = {
    Plane: Plane,
    Hotel: Hotel,
    Ticket: Ticket,
    Car: Car
};



const Bookings = () => {
    const navigate = useNavigate();
    const { trips, updateTrip, activeTripId } = useTrip();
    const [activeTab, setActiveTab] = useState("Final Plan");
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [bookedItemIds, setBookedItemIds] = useState([101, 201, 301, 401]);
    const [tripImages, setTripImages] = useState({});

    // New state for Saved Bookings MVP
    const [bookingType, setBookingType] = useState("Trains");
    const [pnrInput, setPnrInput] = useState("");
    const [savedBookings, setSavedBookings] = useState(() => {
        const saved = sessionStorage.getItem("mockSavedBookings");
        try {
            const parsed = saved ? JSON.parse(saved) : [];
            // Basic validation to prevent crash from old corrupted data
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });

    const deleteBooking = (id) => {
        setSavedBookings(prev => prev.filter(b => b.id !== id));
    };

    useEffect(() => {
        sessionStorage.setItem("mockSavedBookings", JSON.stringify(savedBookings));
    }, [savedBookings]);

    // Filter trips that have an itinerary AND are the currently active trip (MVP logic - no history)
    const availableTrips = trips.filter(t => t.itinerary && t.id === activeTripId);

    // Dynamic Image Fetching & Caching with API Tracking
    useEffect(() => {
        const loadImages = async () => {
            const newImages = { ...tripImages };
            let updatedCount = 0;

            for (const trip of availableTrips) {
                // Rate Control: Check if we already have it
                if (trip.image && !newImages[trip.id]) {
                    newImages[trip.id] = trip.image;
                    updatedCount++;
                    continue;
                }

                if (!trip.image && !newImages[trip.id]) {
                    // Centralized Call
                    const photo = await api.unsplash.fetchPhoto(trip.destination || trip.title);
                    if (photo) {
                        newImages[trip.id] = photo;
                        updatedCount++;
                        // Persist to DB
                        api.trips.update(trip.id, { image: photo }, updateTrip);
                    }
                }
            }

            if (updatedCount > 0) {
                setTripImages(newImages);
            }
        };

        if (availableTrips.length > 0) {
            loadImages();
        }
    }, [availableTrips.length]);

    const toggleBooking = (id) => {
        setBookedItemIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const tabs = ["Final Plan", "Explore and Book", "Saved Bookings"];

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedTrip(null);
    };

    return (
        <div className="bg-slate-50/50 min-h-full">
            <SEO 
                title="Your Bookings"
                url="/bookings"
                description="Manage all your travel bookings in one place. Track flights, hotels, and local transport reservations for your upcoming adventures."
                keywords="travel bookings, manage reservations, travel dashboard, flight tracking, hotel management"
            />
            <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-20 pt-6 pb-8 space-y-6 sm:space-y-8">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">Your Bookings</h1>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex items-center justify-center gap-4 sm:gap-8 border-b border-slate-200 w-full max-w-2xl mx-auto overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`relative pb-3 text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${activeTab === tab
                                    ? "text-sky-600"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-t-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">


                    {activeTab === "Final Plan" && (
                        <motion.div
                            key="final-plan"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {!selectedTrip ? (
                                <Card className="mx-0 sm:mx-4 lg:mx-14 p-4 sm:p-8 min-h-[400px] border border-slate-100 shadow-xl bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-sky-500" />
                                            Trips Ready for Processing
                                        </h2>
                                        <p className="text-slate-500 text-sm">Confirm and book your final itineraries</p>
                                    </div>
                                    <div className="min-h-[300px] flex items-center justify-center">
                                        {availableTrips.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                                                {availableTrips.map((trip) => (
                                                    <motion.div
                                                        key={trip.id}
                                                        whileHover={{ y: -8 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setSelectedTrip(trip)}
                                                        className="cursor-pointer group h-full"
                                                    >
                                                        <Card className="overflow-hidden border border-slate-200 hover:border-sky-200 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                                                            <div className="h-48 overflow-hidden relative">
                                                                <img
                                                                    src={tripImages[trip.id] || trip.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop"}
                                                                    alt={trip.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />
                                                                <div className="absolute bottom-4 left-4 text-white">
                                                                    <h3 className="font-bold text-lg mb-0.5">{trip.title}</h3>
                                                                    <div className="flex items-center gap-2 text-xs font-medium text-white/90">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {trip.destination}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 flex-1 bg-white">
                                                                <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                                                                    <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">{trip.suggestions?.flights?.length || 0} Flights</span>
                                                                    <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">{trip.suggestions?.hotels?.length || 0} Hotels</span>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center space-y-6 text-center py-10">
                                                <div className="bg-slate-50 p-8 rounded-full ring-1 ring-slate-100">
                                                    <Map className="w-12 h-12 text-slate-300" />
                                                </div>
                                                <div className="space-y-2 max-w-sm">
                                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">No active plans found</h3>
                                                    <p className="text-slate-500 font-medium leading-relaxed">
                                                        Head over to the New Trip in the Chat Page to start planning your next adventure and see it here.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/chat')}
                                                    className="px-8 py-3 bg-sky-600 text-white font-bold rounded-2xl hover:bg-sky-700 transition shadow-lg shadow-sky-100 active:scale-95"
                                                >
                                                    Plan a Trip
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ) : (
                                <div className="max-w-4xl mx-auto py-4 pt-0">
                                    <Card className="p-14 relative flex flex-col items-center justify-center text-center space-y-8 border-2 border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden">
                                        {/* Back Button inside Container */}
                                        <button
                                            onClick={() => setSelectedTrip(null)}
                                            className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors group text-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                            Back to Trips
                                        </button>
                                        <div className="relative">
                                            <div className="absolute -inset-4 bg-sky-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                            <div className="relative bg-white p-8 rounded-full shadow-lg ring-1 ring-slate-100">
                                                <Sparkles className="w-16 h-16 text-sky-600" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 max-w-2xl">
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                                Booking Integration Coming Soon
                                            </h2>
                                            <div className="h-1 w-20 bg-sky-600 mx-auto rounded-full"></div>
                                            <p className="text-xl text-slate-500 font-medium leading-relaxed pt-4">
                                                In this section, you will be able to view all the activities and reservations saved in your <span className="text-slate-900 font-bold">"Your Plan"</span> tab and proceed to book them instantly.
                                            </p>

                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                                <Plane className="w-5 h-5 text-slate-400" />
                                                <span className="font-bold text-slate-600">Flights</span>
                                            </div>
                                            <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                                <Hotel className="w-5 h-5 text-slate-400" />
                                                <span className="font-bold text-slate-600">Hotels</span>
                                            </div>
                                            <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                                <Car className="w-5 h-5 text-slate-400" />
                                                <span className="font-bold text-slate-600">Transport</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "Explore and Book" && (
                        <motion.div
                            key="explore-book"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            <Card className="mx-0 sm:mx-4 lg:mx-14 mt-4 sm:mt-10 p-6 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] border-dashed border-2 border-slate-200 bg-sky-50/20 rounded-[24px] sm:rounded-[32px]">
                                <div className="bg-white p-6 rounded-full shadow-md ring-1 ring-sky-100 ">
                                    <Search className="w-12 h-12 text-[#0081C9]" />
                                </div>
                                <div className="max-w-md space-y-1">
                                    <h2 className="text-2xl font-bold text-[#0B1527]">
                                        Explore and Book
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        Browse all available activities and book them individually for your trip.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === "Saved Bookings" && (
                        <motion.div
                            key="saved-bookings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8 max-w-4xl mx-auto"
                        >
                            <Card className="p-4 sm:p-8 border border-slate-200 shadow-xl bg-white rounded-[24px] sm:rounded-[32px]">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <Ticket className="w-6 h-6 text-sky-500" />
                                        Save External Bookings
                                    </h2>
                                    <p className="text-slate-500 text-sm">Have you booked outside the app? Save your PNR or Booking ID here to keep track of everything in one place.</p>
                                </div>

                                <form
                                    className="space-y-6"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!pnrInput.trim()) return;

                                        let mockDetails = {};
                                        if (bookingType === 'Flights') mockDetails = { title: 'IndiGo 6E-201', desc: 'Delhi (DEL) → Mumbai (BOM) · Seat 12A', iconName: 'Plane', color: 'sky' };
                                        else if (bookingType === 'Trains') mockDetails = { title: 'Rajdhani Express (12952)', desc: 'New Delhi → Mumbai Central · AC 1st Class', iconName: 'Ticket', color: 'sky' };
                                        else mockDetails = { title: 'Taj Mahal Palace Hotel', desc: '2 Nights stay · Sea View Deluxe Room', iconName: 'Hotel', color: 'indigo' };


                                        const newBooking = {
                                            id: Date.now(),
                                            pnr: pnrInput.toUpperCase(),
                                            type: bookingType,
                                            ...mockDetails,
                                            date: new Date().toLocaleDateString()
                                        };

                                        setSavedBookings(prev => [newBooking, ...prev]);
                                        setPnrInput('');
                                    }}
                                >
                                    {/* Type Selection */}
                                    <div className="flex gap-2 sm:gap-4">
                                        {['Flights', 'Trains', 'Hotels'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBookingType(type)}
                                                className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${bookingType === type
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                                                    : 'border-slate-100 text-slate-500 hover:border-slate-200'
                                                    }`}
                                            >
                                                {type === 'Flights' && <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                                {type === 'Trains' && <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                                {type === 'Hotels' && <Hotel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Input Field */}
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <input
                                            type="text"
                                            value={pnrInput}
                                            onChange={(e) => setPnrInput(e.target.value)}
                                            placeholder={bookingType === 'Trains' ? "Enter 10-digit PNR Number" : "Enter Booking ID or Reference"}
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 sm:px-8 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition shadow-lg shadow-sky-100 active:scale-95 whitespace-nowrap shrink-0"
                                        >
                                            Save Details
                                        </button>
                                    </div>
                                </form>

                                {/* List of Saved Bookings */}
                                {savedBookings.length > 0 && (
                                    <div className="mt-10 space-y-4">
                                        <h3 className="font-bold text-slate-900 mb-4">Your Saved Bookings</h3>
                                        <div className="space-y-3">
                                            {savedBookings.map(booking => {
                                                const BookingIcon = ICON_MAP[booking.iconName] || Ticket;
                                                return (
                                    <div key={booking.id} className="p-3 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start sm:items-center gap-3 sm:gap-4">
                                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0`}>
                                                            <BookingIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                                                                <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{booking.title}</h4>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 sm:py-1 rounded">PNR: {booking.pnr}</span>
                                                                    <button
                                                                        onClick={() => deleteBooking(booking.id)}
                                                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-slate-500 font-medium">{booking.desc}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1">Saved on {booking.date}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Bookings;
