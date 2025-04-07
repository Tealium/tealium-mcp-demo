---
## Frontend Instructions: MCP Tealium Configuration UI

Use this guide to build a simple UI for configuring and sending Model Context Protocol (MCP) data to Tealium using Next.js, Tailwind CSS, and Shadcn UI.

## Project Overview

This guide focuses on creating a user interface in Next.js to configure basic settings for sending data to Tealium's EventStream API in MCP format.  We'll use Shadcn UI components for a clean and easy-to-use interface.

**Goal:** Create a UI with a few fields to configure basic Tealium and MCP event settings, and a button to send a test event.

## Steps

All new components should go in `/components` and be and be named like `config-form.tsx` unless otherwise specified.
All new pages go in `/app`.

### 1. Install Dependencies (Frontend)

Ensure you have Node.js and npm or yarn installed. Navigate to your project's frontend directory in the terminal and run:

```bash
npm install # or yarn install
npm install framer-motion # if not already installed by Shadcn init


## Proposed directory:
your-project-name/
├── app/
│   ├── tealium-config/       # Page for the Tealium Configuration UI
│   │   └── page.tsx         # Tealium Configuration Page Component
│   └── page.tsx             # (Optional) Home page or other initial pages
├── components/
│   ├── tealium-config-form.tsx # Tealium Configuration Form Component
│   ├── ui/                   # Shadcn UI Components (if you add more beyond Button, Input, Label, Toast)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── toast.tsx
│   └── (other components)    # Other reusable components
├── public/                   # Static assets (images, etc.)
├── styles/                   # (Optional) Custom stylesheets if needed beyond Tailwind
│   └── globals.css          # Global CSS file (Tailwind directives)
├── actions/                  # Server Actions (if you implement backend logic later)
│   └── config-actions.ts    # (Example - Config related server actions, if using backend)
├── lib/                      # Utility functions, helpers, etc. (Optional)
│   └── (utils.ts, etc.)
├── types/                    # TypeScript types (if you create shared types)
│   └── action-types.ts      # (Example - Action state type)
├── .env.local                # Environment variables (Supabase, Tealium - keep local!)
├── next.config.js            # Next.js configuration file
├── package.json              # Project dependencies and scripts
├── postcss.config.js         # PostCSS configuration for Tailwind
├── README.md                 # Project README file
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration


## Recommendations
If you haven't set up Tailwind and Shadcn UI already, follow steps 2 and 3 in the more detailed frontend_instructions.md (previous response), especially the Shadcn UI initialization.

2. Create Configuration Form Component
Create a new Client Component at /components/tealium-config-form.tsx:

// components/tealium-config-form.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Shadcn Button (if you've added it)
import { Input } from '@/components/ui/input';     // Shadcn Input (if you've added it)
import { Label } from '@/components/ui/label';     // Shadcn Label (if you've added it)
import { toast } from 'sonner';                     // Shadcn Toast (optional feedback)

interface TealiumConfigFormProps {
  onSubmitSuccess?: () => void; // Optional callback on success
}

const TealiumConfigForm: React.FC<TealiumConfigFormProps> = ({ onSubmitSuccess }) => {
  const [tealiumAccount, setTealiumAccount] = useState('');
  const [tealiumProfile, setTealiumProfile] = useState('');
  const [eventName, setEventName] = useState('test_event'); // Default event name
  const [userId, setUserId] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const mcpPayload = {
      digital_data: {
        event: {
          eventName: eventName,
          eventInfo: {
            description: "Test event sent via config UI",
          }
        },
        user: {
          userID: userId || "anonymous", // Use userId if entered, else 'anonymous'
        }
        // Add more MCP structure here as needed for your use case
      }
    };

    const apiUrl = `https://collect.tealiumiq.com/eventstream/v2/${tealiumAccount}/${tealiumProfile}/event`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mcpPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Tealium API Error:", errorData);
        toast.error(`Error sending event: ${response.statusText}`);
        return;
      }

      toast.success("Test event sent to Tealium successfully!");
      console.log("Tealium API Response:", await response.json());
      if (onSubmitSuccess) {
        onSubmitSuccess(); // Call success callback if provided
      }

    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(`Fetch error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tealium MCP Configuration</h2>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="tealium-account">Tealium Account</Label>
          <Input
            type="text"
            id="tealium-account"
            placeholder="Your Tealium Account"
            value={tealiumAccount}
            onChange={(e) => setTealiumAccount(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="tealium-profile">Tealium Profile</Label>
          <Input
            type="text"
            id="tealium-profile"
            placeholder="Your Tealium Profile"
            value={tealiumProfile}
            onChange={(e) => setTealiumProfile(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="event-name">Event Name (Test Event)</Label>
          <Input
            type="text"
            id="event-name"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="user-id">User ID (Optional)</Label>
          <Input
            type="text"
            id="user-id"
            placeholder="User ID (optional)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Send Test Event to Tealium
        </Button>
      </div>
    </form>
  );
};

export default TealiumConfigForm;


3. Create a Page to Host the Form
Create a page at /app/tealium-config/page.tsx:

// app/tealium-config/page.tsx
import React from 'react';
import TealiumConfigForm from '@/components/tealium-config-form';

const TealiumConfigPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tealium MCP Configuration UI</h1>
      <TealiumConfigForm />
      <p className="mt-6 text-sm text-gray-600">
        Enter your Tealium Account and Profile, then click "Send Test Event". <br />
        Check the Tealium Data Layer Debugger in your Tealium iQ profile to see the event.
      </p>
    </div>
  );
};

export default TealiumConfigPage;
