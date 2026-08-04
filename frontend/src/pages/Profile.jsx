import React from "react";
import { AnimatePresence } from "framer-motion";
import SEO from "../components/common/SEO";

// Domain Hooks
import useProfileData from "../features/profile/hooks/useProfileData";
import useProfileInteractions from "../features/profile/hooks/useProfileInteractions";

// Header & Navigation Components
import ProfileCoverBanner from "../features/profile/components/ProfileCoverBanner";
import ProfileTopTabs from "../features/profile/components/ProfileTopTabs";
import ProfileSidebar from "../features/profile/components/ProfileSidebar";

// Tab View Components
import OverviewTab from "../features/profile/components/tabs/OverviewTab";
import MyTripsTab from "../features/profile/components/tabs/MyTripsTab";
import MemoriesTab from "../features/profile/components/tabs/MemoriesTab";
import SettingsTab from "../features/profile/components/tabs/SettingsTab";
import QuickStatsTab from "../features/profile/components/tabs/QuickStatsTab";
import AchievementsTab from "../features/profile/components/tabs/AchievementsTab";
import TravelJournalTab from "../features/profile/components/tabs/TravelJournalTab";
import BucketListTab from "../features/profile/components/tabs/BucketListTab";
import WorldExplorer from "../features/profile/components/tabs/WorldExplorer";

const topTabs = ["Overview", "My Trips", "Memories", "Settings"];

function ProfileDashboard({ user }) {
  const {
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
  } = useProfileInteractions(user.bucketList);

  return (
    <div className="bg-slate-50/50 w-full min-h-full flex flex-col pb-20">
      <SEO
        title="Travel Dashboard"
        url="/profile"
        description="View your travel stats, upcoming trips, bucket list, and digital memories. Your personal command center for all things travel."
        keywords="travel dashboard, user profile, travel stats, bucket list, travel memories"
      />

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-10 lg:px-20 pt-6">
        <ProfileCoverBanner
          user={user}
          handleEditProfile={handleEditProfile}
          handleUpdateAvatar={handleUpdateAvatar}
        />

        <ProfileTopTabs
          topTabs={topTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "Overview" && <OverviewTab user={user} />}
              {activeTab === "My Trips" && <MyTripsTab user={user} handleLike={handleLike} />}
              {activeTab === "Memories" && <MemoriesTab user={user} />}
              {activeTab === "Settings" && <SettingsTab user={user} handlePrivacySettings={handlePrivacySettings} />}
              {activeTab === "Quick Stats" && <QuickStatsTab user={user} />}
              {activeTab === "World Explorer" && <WorldExplorer user={user} />}
              {activeTab === "Achievements" && <AchievementsTab user={user} />}
              {activeTab === "Travel Journal" && (
                <TravelJournalTab
                  isWritingJournal={isWritingJournal}
                  setIsWritingJournal={setIsWritingJournal}
                  journalEntry={journalEntry}
                  setJournalEntry={setJournalEntry}
                  savedJournal={savedJournal}
                  handleSaveJournal={handleSaveJournal}
                />
              )}
              {activeTab === "Bucket List" && (
                <BucketListTab
                  bucketList={bucketList}
                  newBucketItem={newBucketItem}
                  setNewBucketItem={setNewBucketItem}
                  handleAddBucketItem={handleAddBucketItem}
                  toggleBucketList={toggleBucketList}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileWrapper() {
  const { user } = useProfileData();
  return <ProfileDashboard user={user} />;
}
