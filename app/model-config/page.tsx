'use client';

import React from 'react';
import AiModelConfigForm from '@/components/ai-model-config-form';

export default function ModelConfigPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        AI Model Configuration
      </h1>
      <AiModelConfigForm onSubmitSuccess={() => alert('Success!')} />
    </div>
  );
} 