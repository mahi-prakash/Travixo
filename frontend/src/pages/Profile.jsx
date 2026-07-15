import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Plane, Bookmark, Award, Globe, Pen, Camera, Globe2, MapPin, Calendar, ClipboardList, Plus, Heart, Settings, ShieldCheck, ChevronRight, BookOpen, Sun, Utensils, Compass, Send } from "lucide-react";
import { useUser } from "../context/UserContext";
import SEO from "../components/common/SEO";
import Planner from './Planner';

const ProfileDashboard = ({ user }) => {
  const [activeNav, setActiveNav] = useState('Profile');
  const [activeTab, setActiveTab] = useState('Overview');

  const navItems = ['Chat', 'Planner', 'Bookings', 'Explore', 'Profile'];
  const profileTabs = ['Overview', 'My Trips', 'Memories', 'Settings'];

  // Bucket list state for interactivity
  const [bucketList, setBucketList] = useState(user.bucketList);
  const [newBucketItem, setNewBucketItem] = useState('');

  // Journal State
  const [isWritingJournal, setIsWritingJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
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
    setNewBucketItem('');
  };

  const handleSaveJournal = () => {
    if (journalEntry.trim()) {
      setSavedJournal(journalEntry);
    } else {
      setSavedJournal(null);
    }
    setIsWritingJournal(false);
  };

  // Handlers for dynamic actions
  const handleEditProfile = () => alert("Edit Profile Clicked");
  const handleUpdateAvatar = () => alert("Update Avatar Clicked");
  const handlePrivacySettings = () => alert("Privacy & Security Clicked");
  const handleLike = (title) => alert(`Liked ${title}!`);

  return (
    <div className="dashboard-wrapper">
      <SEO 
        title="Travel Dashboard"
        url="/profile"
        description="View your travel stats, upcoming trips, bucket list, and digital memories. Your personal command center for all things travel."
        keywords="travel dashboard, user profile, travel stats, bucket list, travel memories"
      />
      <style>{`
        :root {
            --primary-blue: #0081C9;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --text-light: #94a3b8;
            --bg-main: #f8fafc;
            --bg-card: #ffffff;
            --font-main: 'Inter', sans-serif;
            --blue-light: #f0f9ff;
            --blue-dark: #0081C9;
            --red-light: #fef2f2;
            --red-dark: #ef4444;
            --red-accent: #f87171;
            --yellow-light: #fefce8;
            --yellow-dark: #eab308;
            --green-light: #f0fdf4;
            --green-dark: #22c55e;
            --purple-light: #faf5ff;
            --purple-dark: #a855f7;
        }
        .dashboard-wrapper {
            font-family: var(--font-main);
            background-color: var(--bg-main);
            color: var(--text-main);
            line-height: 1.5;
            min-height: 100vh;
        }
        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 2rem 4rem 2rem;
        }
        .cover-banner {
            position: relative;
            height: 280px;
            border-radius: 32px;
            background-size: cover;
            background-position: center;
            margin-bottom: 2rem;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .cover-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.2) 100%);
        }
        .btn-edit-profile {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 16px;
            font-size: 0.85rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
            z-index: 10;
        }
        .btn-edit-profile:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        .banner-content {
            position: absolute;
            bottom: 2.5rem;
            left: 2.5rem;
            display: flex;
            align-items: flex-end;
            gap: 1.75rem;
            z-index: 10;
        }
        .profile-avatar-wrapper {
            position: relative;
        }
        .main-avatar {
            width: 128px;
            height: 128px;
            border-radius: 28px;
            border: 5px solid white;
            object-fit: cover;
            background: white;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .btn-camera {
            position: absolute;
            bottom: -5px;
            right: -5px;
            background-color: var(--primary-blue);
            color: white;
            border: 4px solid white;
            width: 40px;
            height: 40px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .btn-camera:hover {
            transform: scale(1.1);
        }
        .profile-info {
            color: white;
            padding-bottom: 0.75rem;
        }
        .profile-name {
            font-size: 2.5rem;
            font-weight: 900;
            margin: 0 0 0.25rem 0;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            letter-spacing: -0.025em;
        }
        .profile-meta {
            font-size: 0.95rem;
            font-weight: 600;
            opacity: 0.95;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }
        .profile-tabs-container {
            display: flex;
            justify-content: center;
            gap: 2.5rem;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 3rem;
            width: 100%;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .profile-tab {
            background: none;
            border: none;
            font-family: inherit;
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748b;
            padding: 0 0.25rem 0.75rem 0.25rem;
            cursor: pointer;
            position: relative;
            transition: color 0.3s ease;
        }
        .profile-tab:hover {
            color: #0f172a;
        }
        .profile-tab.active {
            color: var(--primary-blue);
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: 320px 1fr 1fr;
            grid-auto-rows: minmax(min-content, max-content);
            gap: 2rem;
        }
        .sidebar-column, .main-column, .grid-2-cols {
            display: contents;
        }
        .card {
            background-color: var(--bg-card);
            border-radius: 32px;
            padding: 2rem;
            box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.03);
            border: 1px solid #f1f5f9;
        }
        .flex-col-card {
            display: flex;
            flex-direction: column;
        }
        .card-title {
            font-size: 0.75rem;
            color: var(--text-light);
            letter-spacing: 0.1em;
            font-weight: 800;
            margin-bottom: 1.75rem;
            margin-top: 0;
            text-transform: uppercase;
        }
        .mt-auto { margin-top: auto; }
        .mt-4 { margin-top: 1.5rem; }
        .stats-card { 
            grid-column: 1; 
            grid-row: 1; 
            position: relative;
            overflow: hidden;
            background-size: cover;
            background-position: center;
            background-image: url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=800&auto=format&fit=crop');
        }
        .stats-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
            z-index: 1;
        }
        .stats-content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .upcoming-trip-card { grid-column: 2 / 4; grid-row: 1; }
        .badges-card { grid-column: 1; grid-row: 2; }
        .map-card { grid-column: 2; grid-row: 2 / 4; }
        .bucketlist-card { grid-column: 3; grid-row: 2 / 4; }
        .journal-card { grid-column: 1; grid-row: 3; }
        .full-span-card {
            grid-column: 2 / 4;
            grid-row: 1 / 4;
        }
        .stat-row {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            margin-bottom: 0.5rem;
        }
        .stat-icon-wrapper {
            width: 52px;
            height: 52px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            background: white;
            border: 1.5px solid var(--primary-blue);
            box-shadow: 0 4px 12px rgba(0, 129, 201, 0.08);
        }
        .bg-blue-light { background-color: #f0f9ff; }
        .text-blue { color: #0081C9; }
        .bg-red-light { background-color: #fef2f2; }
        .text-red { color: #ef4444; }
        .text-red-accent { color: #f87171; }
        .bg-yellow-light { background-color: #fefce8; }
        .text-yellow { color: #eab308; }
        .bg-green-light { background-color: #f0fdf4; }
        .text-green { color: #22c55e; }
        .stat-name {
            flex-grow: 1;
            font-weight: 700;
            color: #475569;
            font-size: 0.95rem;
        }
        .stat-value {
            font-weight: 800;
            font-size: 1.15rem;
            color: var(--text-main);
            letter-spacing: -0.01em;
        }
        .badges-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            justify-content: space-between;
        }
        .badge-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .badge-item:hover { transform: translateY(-3px); }
        .badge-icon {
            width: 64px;
            height: 64px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            background: white;
            border: 1.5px solid var(--primary-blue);
            box-shadow: 0 4px 12px rgba(0, 129, 201, 0.08);
            color: var(--primary-blue);
        }
        .badge-name {
            font-size: 0.8rem;
            font-weight: 700;
            color: #64748b;
            text-align: center;
            max-width: 80px;
        }
        .card-header-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .section-title {
            font-size: 1.5rem;
            font-weight: 900;
            margin: 0;
            color: var(--text-main);
            letter-spacing: -0.02em;
        }
        .btn-link {
            background: none;
            border: none;
            color: var(--primary-blue);
            font-weight: 800;
            font-size: 0.9rem;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .trip-banner {
            position: relative;
            border-radius: 28px;
            background-size: cover;
            background-position: center;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .trip-banner:hover { transform: translateY(-4px); box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.15); }
        .trip-banner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
        }
        .weather-widget {
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 14px;
            font-weight: 700;
            font-size: 0.85rem;
        }
        .trip-banner-content {
            position: absolute;
            bottom: 2rem;
            left: 2rem;
            color: white;
            width: calc(100% - 4rem);
        }
        .trip-header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }
        .trip-status {
            background-color: #22c55e;
            padding: 0.35rem 0.85rem;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .trip-countdown {
            font-size: 0.85rem;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.15);
            padding: 0.35rem 0.85rem;
            border-radius: 12px;
            backdrop-filter: blur(4px);
        }
        .trip-banner-content h3 {
            margin: 0 0 0.4rem 0;
            font-size: 2rem;
            font-weight: 900;
            letter-spacing: -0.02em;
        }
        .trip-banner-content p {
            margin: 0;
            font-size: 1rem;
            opacity: 0.95;
            font-weight: 500;
        }
        .icon-large { font-size: 1.75rem; }
        .map-placeholder {
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #f1f5f9;
        }
        .progress-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            font-size: 0.9rem;
            font-weight: 700;
            color: #64748b;
        }
        .progress-bar-container {
            height: 14px;
            background-color: #f1f5f9;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #f1f5f9;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(to right, #0081C9, #6366f1);
            border-radius: 8px;
        }
        .bucket-list {
            list-style: none;
            padding: 0;
            margin: 0 0 2rem 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            overflow-y: auto;
            max-height: 280px;
            padding-right: 0.5rem;
        }
        .bucket-item {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            cursor: pointer;
            padding: 0.75rem 1rem;
            border-radius: 16px;
            transition: all 0.2s ease;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
        }
        .bucket-item:hover { background: #f1f5f9; border-color: #e2e8f0; }
        .checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid #cbd5e1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.8rem;
            background: white;
        }
        .checkbox.checked {
            background-color: var(--primary-blue);
            border-color: var(--primary-blue);
            box-shadow: 0 4px 6px -1px rgba(0, 129, 201, 0.3);
        }
        .bucket-item.completed span {
            text-decoration: line-through;
            color: #94a3b8;
            font-weight: 500;
        }
        .bucket-item span {
            font-weight: 700;
            color: var(--text-main);
            font-size: 0.95rem;
        }
        .add-bucket-form { display: flex; gap: 0.75rem; }
        .bucket-input {
            flex-grow: 1;
            padding: 0.85rem 1.25rem;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 600;
            outline: none;
            transition: all 0.2s;
            background: #f8fafc;
        }
        .bucket-input:focus {
            border-color: var(--primary-blue);
            background: white;
            box-shadow: 0 0 0 4px rgba(0, 129, 201, 0.1);
        }
        .bucket-submit-btn {
            background: white;
            color: var(--primary-blue);
            border: 1.5px solid var(--primary-blue);
            border-radius: 16px;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(0, 129, 201, 0.08);
        }
        .bucket-submit-btn:hover { 
            background: var(--blue-light);
            transform: translateY(-2px); 
        }
        .trips-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        .memory-card {
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.2s;
        }
        .memory-card:hover { transform: translateY(-5px); }
        .memory-img-wrapper {
            position: relative;
            height: 200px;
            width: 100%;
            overflow: hidden;
        }
        .memory-img-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }
        .memory-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            padding: 1rem;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .memory-card:hover .memory-overlay { opacity: 1; }
        .like-btn {
            background: white;
            color: var(--red-dark);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .memory-info {
            padding: 1.25rem;
            background: white;
        }
        .memory-info-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        .memory-info-top h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 700;
        }
        .likes-count {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-muted);
        }
        .memory-info p {
            margin: 0;
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        .gallery-masonry {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            grid-auto-rows: 250px;
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        .gallery-item {
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .gallery-item:hover { transform: translateY(-5px); }
        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s;
        }
        .gallery-item-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 2rem 1.5rem 1.5rem 1.5rem;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
            display: flex;
            flex-direction: column;
            color: white;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .gallery-item:hover .gallery-item-overlay { opacity: 1; }
        .gallery-title { font-weight: 800; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .gallery-location { font-size: 0.8rem; opacity: 0.9; }
        .settings-title {
            font-size: 1.5rem;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 1rem;
            margin: 0 0 2.5rem 0;
            color: var(--text-main);
            letter-spacing: -0.02em;
        }
        .settings-fields-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2.5rem;
        }
        .settings-field {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .settings-field label {
            font-size: 0.75rem;
            font-weight: 800;
            color: #64748b;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .input-box {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.25rem;
            background-color: #f8fafc;
            border-radius: 18px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
        }
        .input-box:focus-within {
            border-color: var(--primary-blue);
            background: white;
            box-shadow: 0 0 0 4px rgba(0, 129, 201, 0.1);
        }
        .input-box input {
            border: none;
            background: transparent;
            font-family: inherit;
            font-weight: 700;
            font-size: 1rem;
            color: var(--text-main);
            width: 100%;
            outline: none;
        }
        .bg-blue-tint {
            background-color: #f0f9ff;
            border-color: #e0f2fe;
        }
        .vibe-text {
            font-weight: 800;
            color: #0081C9;
            font-size: 1rem;
        }
        .privacy-section {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.75rem;
            background-color: #f8fafc;
            border-radius: 28px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid #f1f5f9;
        }
        .privacy-section:hover { background-color: white; border-color: var(--primary-blue); transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0, 129, 201, 0.2); }
        .privacy-icon {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            background-color: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            color: #64748b;
        }
        .privacy-info { flex-grow: 1; }
        .privacy-info h4 { margin: 0 0 0.35rem 0; font-size: 1.1rem; font-weight: 800; color: var(--text-main); }
        .privacy-info p { margin: 0; font-size: 0.9rem; color: #64748b; font-weight: 500; }

        @media (max-width: 900px) {
            .dashboard-grid { grid-template-columns: 1fr; }
            .stats-card, .upcoming-trip-card, .badges-card, .map-card, .bucketlist-card, .journal-card, .full-span-card {
                grid-column: 1 / -1;
                grid-row: auto;
            }
            .settings-fields-row { grid-template-columns: 1fr; }
        }
      `}</style>


      <main className="dashboard-container">
        {/* Cover Banner Section */}
        <section className="cover-banner" style={{ backgroundImage: `url(${user.coverImage})` }}>
          <div className="cover-overlay"></div>

          <button className="btn-edit-profile" onClick={handleEditProfile}>
            <i className="fa-solid fa-pen"></i> Edit Profile
          </button>

          <div className="banner-content">
            <div className="profile-avatar-wrapper">
              <img src={user.avatarImage} alt={user.profileName} className="main-avatar" />
              <button className="btn-camera" onClick={handleUpdateAvatar} aria-label="Update avatar">
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{user.profileName}</h1>
              <p className="profile-meta">
                <i className="fa-solid fa-location-dot text-red-accent"></i> {user.location} &middot; {user.joinedDate}
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic Profile Tabs */}
        <div className="profile-tabs-container">
          {profileTabs.map(tab => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="profileTabIndicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--primary-blue)',
                    borderRadius: '9999px'
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Perfect Grid Layout */}
        <div className="dashboard-grid">

          {/* Left Sidebar (participates in display: contents) */}
          <div className="sidebar-column">

            {/* Row 1, Col 1 */}
            <section className="card stats-card flex-col-card">
              <div className="stats-overlay"></div>
              <div className="stats-content">
                <h3 className="card-title">QUICK STATS</h3>
                <div className="stats-list" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                  <div className="stat-row">
                    <div className="stat-icon-wrapper">
                      <Plane size={24} className="text-[#0081C9]" />
                    </div>
                    <span className="stat-name">Trips Planned</span>
                    <span className="stat-value">{user.stats.tripsPlanned}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-icon-wrapper">
                      <Bookmark size={24} className="text-[#0081C9]" />
                    </div>
                    <span className="stat-name">Places Saved</span>
                    <span className="stat-value">{user.stats.placesSaved}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-icon-wrapper">
                      <Award size={24} className="text-[#0081C9]" />
                    </div>
                    <span className="stat-name">Miles Traveled</span>
                    <span className="stat-value">{user.stats.milesTraveled}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-icon-wrapper">
                      <Globe size={24} className="text-[#0081C9]" />
                    </div>
                    <span className="stat-name">Countries Visited</span>
                    <span className="stat-value">{user.stats.countriesVisited}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Row 2, Col 1 */}
            <section className="card badges-card flex-col-card">
              <h3 className="card-title">ACHIEVEMENTS</h3>
              <div className="badges-grid" style={{ flexGrow: 1, alignContent: 'center' }}>
                {user.badges.map(badge => {
                  const IconComponent = badge.name === "Early Bird" ? Sun : (badge.name === "Foodie" ? Utensils : Compass);
                  return (
                    <div className="badge-item" key={badge.id} title={badge.name}>
                      <div className="badge-icon">
                        <IconComponent size={28} />
                      </div>
                      <span className="badge-name">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Row 3, Col 1 */}
            <section className="card journal-card flex-col-card">
              <h3 className="card-title">TRAVEL JOURNAL</h3>

              {isWritingJournal ? (
                <div className="journal-editor" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <textarea
                    autoFocus
                    placeholder="How are you feeling about your upcoming trip?"
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    className="journal-textarea"
                  />
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={() => setIsWritingJournal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '16px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                    <button onClick={handleSaveJournal} className="btn-journal-save" style={{ flex: 2, marginTop: 0 }}>Save Entry</button>
                  </div>
                </div>
              ) : savedJournal ? (
                <div className="journal-saved" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div className="journal-date text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Latest Entry</div>
                  <p className="journal-text" style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1.5rem', flexGrow: 1 }}>"{savedJournal}"</p>
                  <button className="mt-auto" onClick={() => setIsWritingJournal(true)} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: '#eff6ff', color: 'var(--primary-blue)', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-pen"></i> Edit Entry
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', flexGrow: 1 }}>
                    You haven't logged any notes for your upcoming trips yet.
                  </p>
                  <button className="mt-auto" onClick={() => setIsWritingJournal(true)} style={{
                    width: '100%', padding: '0.85rem', borderRadius: '16px', background: 'var(--primary-blue)',
                    color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}>
                    <i className="fa-solid fa-book-open"></i> Write Entry
                  </button>
                </>
              )}
            </section>
          </div>

          {/* Main Content Column (participates in display: contents) */}
          <div className="main-column">

            {activeTab === 'Overview' && (
              <>
                {/* Row 1, Col 2 to 3 */}
                <section className="card upcoming-trip-card flex-col-card">
                  <div className="card-header-flex">
                    <h3 className="section-title">Upcoming Journey</h3>
                    <button className="btn-link">View Itinerary <i className="fa-solid fa-arrow-right ml-1"></i></button>
                  </div>
                  {user.upcomingTrips.map(trip => (
                    <div className="trip-banner" style={{ backgroundImage: `url(${trip.image})`, flexGrow: 1, marginBottom: 0 }} key={trip.id}>
                      <div className="trip-banner-overlay"></div>

                      <div className="weather-widget">
                        <i className="fa-solid fa-sun text-yellow"></i> {trip.weather}
                      </div>

                      <div className="trip-banner-content">
                        <div className="trip-header-info">
                          <span className="trip-status">{trip.status}</span>
                          <span className="trip-countdown"><i className="fa-regular fa-clock"></i> In {trip.daysUntil} Days</span>
                        </div>
                        <h3>{trip.destination}</h3>
                        <p><i className="fa-regular fa-calendar text-sky-700"></i> {trip.date}</p>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Sub-grid container that will also use display: contents to join the main grid */}
                <div className="grid-2-cols">
                  {/* Row 2 & 3, Col 2 */}
                  <section className="card map-card flex-col-card">
                    <div className="card-header-flex">
                      <h2 className="section-title">World Explorer</h2>
                      <i className="fa-solid fa-map-location-dot text-blue icon-large"></i>
                    </div>

                    <div className="map-placeholder" style={{ padding: 0, border: 'none', flexGrow: 1, position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29ybGQlMjBtYXB8ZW58MHx8MHx8fDA%3D"
                        alt="Travel Map"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div className="progress-footer mt-4">
                      <div className="progress-header">
                        <span className="font-bold">{user.stats.countriesVisited} Countries</span>
                        <span className="text-muted text-sm">Goal: 50</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${(user.stats.countriesVisited / 50) * 100}%` }}></div>
                      </div>
                    </div>
                  </section>

                  {/* Row 2 & 3, Col 3 */}
                  <section className="card bucketlist-card flex-col-card">
                    <div className="card-header-flex">
                      <h2 className="section-title">Bucket List</h2>
                      <i className="fa-solid fa-clipboard-list text-blue icon-large"></i>
                    </div>

                    <ul className="bucket-list" style={{ flexGrow: 1 }}>
                      {bucketList.map(item => (
                        <li key={item.id} className={`bucket-item ${item.completed ? 'completed' : ''}`} onClick={() => toggleBucketList(item.id)}>
                          <div className={`checkbox ${item.completed ? 'checked' : ''}`}>
                            {item.completed && <i className="fa-solid fa-check"></i>}
                          </div>
                          <span>{item.place}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Add new bucket list item form */}
                    <form onSubmit={handleAddBucketItem} className="add-bucket-form mt-4">
                      <input
                        type="text"
                        placeholder="Add new destination..."
                        value={newBucketItem}
                        onChange={(e) => setNewBucketItem(e.target.value)}
                        className="bucket-input"
                      />
                      <button type="submit" className="bucket-submit-btn">
                        <Send size={20} />
                      </button>
                    </form>
                  </section>
                </div>
              </>
            )}

            {activeTab === 'My Trips' && (
              <section className="card trips-list-card full-span-card">
                <h2 className="section-title">Past Adventures</h2>
                <div className="trips-grid">
                  {user.recentMemories.map(mem => (
                    <div className="memory-card" key={mem.id}>
                      <div className="memory-img-wrapper">
                        <img src={mem.image} alt={mem.title} />
                        <div className="memory-overlay">
                          <button className="like-btn" onClick={() => handleLike(mem.title)}>
                            <i className="fa-solid fa-heart"></i>
                          </button>
                        </div>
                      </div>
                      <div className="memory-info">
                        <div className="memory-info-top">
                          <h4>{mem.title}</h4>
                          <span className="likes-count"><i className="fa-solid fa-heart text-red"></i> {mem.likes}</span>
                        </div>
                        <p><i className="fa-solid fa-location-dot text-red-accent"></i> {mem.location} &middot; {mem.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'Memories' && (
              <section className="card memories-card full-span-card">
                <h2 className="section-title">Photo Gallery</h2>
                <p className="text-muted">A collection of your favorite captured moments around the world.</p>
                <div className="gallery-masonry">
                  {user.recentMemories.map(mem => (
                    <div className="gallery-item" key={mem.id}>
                      <img src={mem.image} alt={mem.title} />
                      <div className="gallery-item-overlay">
                        <span className="gallery-title">{mem.title}</span>
                        <span className="gallery-location"><i className="fa-solid fa-location-dot"></i> {mem.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'Settings' && (
              <section className="card settings-card full-span-card">
                <h2 className="settings-title">
                  <i className="fa-solid fa-gear text-blue"></i> Account Settings
                </h2>

                <div className="settings-fields-row">
                  <div className="settings-field">
                    <label>EMAIL ADDRESS</label>
                    <div className="input-box">
                      <i className="fa-regular fa-envelope text-gray"></i>
                      <input type="email" value={user.email} readOnly />
                    </div>
                  </div>

                  <div className="settings-field">
                    <label>TRAVELER VIBE</label>
                    <div className="input-box bg-blue-tint">
                      <i className="fa-solid fa-globe text-blue"></i>
                      <span className="vibe-text">{user.vibe}</span>
                    </div>
                  </div>
                </div>

                <div className="privacy-section" onClick={handlePrivacySettings}>
                  <div className="privacy-icon bg-gray-light">
                    <i className="fa-solid fa-shield-halved text-gray"></i>
                  </div>
                  <div className="privacy-info">
                    <h4>Privacy & Security</h4>
                    <p>Manage password and account access</p>
                  </div>
                  <div className="privacy-arrow">
                    <i className="fa-solid fa-chevron-right text-gray-light"></i>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

const ProfileWrapper = () => {
  const { user } = useUser();
  const mockUser = {
    navName: user?.user_metadata?.full_name || "Guest Explorer",
    navAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&auto=format&fit=crop",
    avatarImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop",
    profileName: user?.user_metadata?.full_name || "Guest Explorer",
    location: "Global Nomad",
    joinedDate: "Joined April 2026",
    email: user?.email || "guest@example.com",
    vibe: "Modern Nomad",
    stats: {
      tripsPlanned: 12,
      placesSaved: 48,
      milesTraveled: "14.2k",
      countriesVisited: 8
    },
    badges: [
      { id: 1, name: "Early Bird", icon: "fa-sun", color: "text-purple" },
      { id: 2, name: "Foodie", icon: "fa-utensils", color: "text-red" },
      { id: 3, name: "Explorer", icon: "fa-compass", color: "text-blue" }
    ],
    bucketList: [
      { id: 1, place: "See Northern Lights in Iceland", completed: true },
      { id: 2, place: "Hike Mount Fuji, Japan", completed: false },
      { id: 3, place: "Eat pizza in Naples, Italy", completed: false }
    ],
    upcomingTrips: [
      { id: 1, destination: "Tokyo, Japan", date: "Nov 12 - Nov 20, 2024", image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9reW98ZW58MHx8MHx8fDA%3D", status: "READY", daysUntil: 45, weather: "18°C" }
    ],
    visitedPins: [
      { id: 1, name: "Paris", lat: 48.8566, lng: 2.3522 },
      { id: 2, name: "New York", lat: 40.7128, lng: -74.0060 },
      { id: 3, name: "Tokyo", lat: 35.6762, lng: 139.6503 }
    ],
    recentMemories: [
      { id: 1, title: "Sunset at Eiffel", location: "Paris, France", date: "Oct 2023", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600", likes: 124 },
      { id: 2, title: "Central Park Stroll", location: "NYC, USA", date: "Dec 2023", image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=600", likes: 89 },
      { id: 3, title: "Sushi Night", location: "Tokyo, Japan", date: "Mar 2024", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600", likes: 210 }
    ]
  };

  return <ProfileDashboard user={mockUser} />;
};

export default ProfileWrapper;
