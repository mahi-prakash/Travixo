import { useState } from "react";

export default function useProfileInteractions(initialBucketList = []) {
  const [activeTab, setActiveTab] = useState("Overview");

  // Bucket list state for interactivity
  const [bucketList, setBucketList] = useState(initialBucketList);
  const [newBucketItem, setNewBucketItem] = useState("");

  // Journal State
  const [isWritingJournal, setIsWritingJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [savedJournal, setSavedJournal] = useState(null);

  const toggleBucketList = (id) => {
    setBucketList(bucketList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddBucketItem = (e) => {
    e.preventDefault();
    if (!newBucketItem.trim()) return;
    setBucketList([...bucketList, { id: Date.now(), place: newBucketItem, completed: false }]);
    setNewBucketItem("");
  };

  const handleSaveJournal = () => {
    if (journalEntry.trim()) {
      setSavedJournal(journalEntry);
    } else {
      setSavedJournal(null);
    }
    setIsWritingJournal(false);
  };

  const handleEditProfile = () => alert("Edit Profile Clicked");
  const handleUpdateAvatar = () => alert("Update Avatar Clicked");
  const handlePrivacySettings = () => alert("Privacy & Security Clicked");
  const handleLike = (title) => alert(`Liked ${title}!`);

  return {
    activeTab,
    setActiveTab,
    bucketList,
    newBucketItem,
    setNewBucketItem,
    toggleBucketList,
    handleAddBucketItem,
    isWritingJournal,
    setIsWritingJournal,
    journalEntry,
    setJournalEntry,
    savedJournal,
    handleSaveJournal,
    handleEditProfile,
    handleUpdateAvatar,
    handlePrivacySettings,
    handleLike
  };
}
