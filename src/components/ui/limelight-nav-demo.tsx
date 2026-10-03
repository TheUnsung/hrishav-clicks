"use client";

import React from 'react';
import { LimelightNav, NavItem } from "@/components/ui/limelight-nav";
import { Home, Bookmark, PlusCircle, User, Settings } from 'lucide-react';

const customNavItems: NavItem[] = [
  { id: 'home', icon: <Home />, label: 'Home', onClick: () => console.log('Home Clicked!') },
  { id: 'bookmark', icon: <Bookmark />, label: 'Bookmarks', onClick: () => console.log('Bookmark Clicked!') },
  { id: 'add', icon: <PlusCircle />, label: 'Add New', onClick: () => console.log('Add Clicked!') },
  { id: 'profile', icon: <User />, label: 'Profile', onClick: () => console.log('Profile Clicked!') },
  { id: 'settings', icon: <Settings />, label: 'Settings', onClick: () => console.log('Settings Clicked!') },
];

export const Customized = () => {
  return <LimelightNav className="bg-secondary dark:bg-card/50 dark:border-accent/50 rounded-xl" items={customNavItems} />;
};

export const Default = () => {
  return <LimelightNav />;
};

export default function LimelightNavDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12 bg-background text-foreground min-h-[300px]">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Default</h3>
        <Default />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Customized</h3>
        <Customized />
      </div>
    </div>
  );
}
