import { NextResponse } from 'next/server';

// Parameter field type definitions
type ParameterField = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'switch' | 'select' | 'textarea';
  defaultValue: string | number | boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  description: string;
  required?: boolean;
};

// Enhanced model data structure with parameter fields for each model
const AVAILABLE_MODELS = {
  'openai': [
    { 
      name: 'GPT-4', 
      versions: ['turbo', 'o', 'vision'],
      compatibleTypes: ['text-generation', 'chat', 'function-calling'],
      parameters: {
        common: [
          {
            name: 'max_tokens',
            label: 'Max Tokens',
            type: 'number',
            defaultValue: 2048,
            min: 1,
            max: 8192,
            step: 1,
            description: 'Maximum number of tokens for completion/generation',
            required: true
          },
          {
            name: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.7,
            min: 0,
            max: 2,
            step: 0.1,
            description: 'Controls randomness (0-2, lower = more deterministic)',
            required: true
          }
        ],
        advanced: [
          {
            name: 'top_p',
            label: 'Top P',
            type: 'number',
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.05,
            description: 'Nucleus sampling: consider the results of tokens with top_p probability mass',
            required: false
          },
          {
            name: 'frequency_penalty',
            label: 'Frequency Penalty',
            type: 'number',
            defaultValue: 0,
            min: -2,
            max: 2,
            step: 0.1,
            description: 'Penalize repeated tokens (-2.0 to 2.0)',
            required: false
          },
          {
            name: 'presence_penalty',
            label: 'Presence Penalty',
            type: 'number',
            defaultValue: 0,
            min: -2,
            max: 2,
            step: 0.1,
            description: 'Penalize new tokens based on their presence in the text so far (-2.0 to 2.0)',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"top_p": 0.9, "frequency_penalty": 0.5}',
          advanced: '{"top_p": 0.95, "frequency_penalty": 0.8, "presence_penalty": 0.6, "logit_bias": {"50256": -100}}'
        },
        description: 'top_p, frequency_penalty, presence_penalty, logit_bias'
      }
    },
    { 
      name: 'GPT-3.5', 
      versions: ['turbo', 'turbo-16k'],
      compatibleTypes: ['text-generation', 'chat', 'function-calling'],
      parameters: {
        common: [
          {
            name: 'max_tokens',
            label: 'Max Tokens',
            type: 'number',
            defaultValue: 2048,
            min: 1,
            max: 4096,
            step: 1,
            description: 'Maximum number of tokens for completion/generation',
            required: true
          },
          {
            name: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.7,
            min: 0,
            max: 2,
            step: 0.1,
            description: 'Controls randomness (0-2, lower = more deterministic)',
            required: true
          }
        ],
        advanced: [
          {
            name: 'top_p',
            label: 'Top P',
            type: 'number',
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.05,
            description: 'Nucleus sampling: consider the results of tokens with top_p probability mass',
            required: false
          },
          {
            name: 'frequency_penalty',
            label: 'Frequency Penalty',
            type: 'number',
            defaultValue: 0,
            min: -2,
            max: 2,
            step: 0.1,
            description: 'Penalize repeated tokens (-2.0 to 2.0)',
            required: false
          },
          {
            name: 'presence_penalty',
            label: 'Presence Penalty',
            type: 'number',
            defaultValue: 0,
            min: -2,
            max: 2,
            step: 0.1,
            description: 'Penalize new tokens based on their presence in the text so far (-2.0 to 2.0)',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"top_p": 0.9, "frequency_penalty": 0.5}',
          advanced: '{"top_p": 0.9, "frequency_penalty": 0.6, "presence_penalty": 0.6}'
        },
        description: 'top_p, frequency_penalty, presence_penalty'
      }
    },
    { 
      name: 'Ada', 
      versions: ['002'],
      compatibleTypes: ['embeddings'],
      parameters: {
        common: [
          {
            name: 'dimensions',
            label: 'Embedding Dimensions',
            type: 'number',
            defaultValue: 1536,
            min: 1,
            max: 1536,
            step: 1,
            description: 'Number of dimensions for the embedding vectors',
            required: true
          }
        ],
        advanced: [
          {
            name: 'encoding_format',
            label: 'Encoding Format',
            type: 'select',
            options: [
              { value: 'float', label: 'Float' },
              { value: 'base64', label: 'Base64' }
            ],
            defaultValue: 'float',
            description: 'Format of the output embedding',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"encoding_format": "float"}'
        },
        description: 'encoding_format, dimensions'
      }
    },
  ],
  'anthropic': [
    { 
      name: 'Claude', 
      versions: ['3 Opus', '3 Sonnet', '3 Haiku', '2', '2.1'],
      compatibleTypes: ['text-generation', 'chat', 'function-calling'],
      parameters: {
        common: [
          {
            name: 'max_tokens',
            label: 'Max Tokens',
            type: 'number',
            defaultValue: 4096,
            min: 1,
            max: 100000,
            step: 1,
            description: 'Maximum number of tokens to generate',
            required: true
          },
          {
            name: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.7,
            min: 0,
            max: 1,
            step: 0.1,
            description: 'Controls randomness (0-1, lower = more deterministic)',
            required: true
          }
        ],
        advanced: [
          {
            name: 'top_p',
            label: 'Top P',
            type: 'number',
            defaultValue: 0.9,
            min: 0,
            max: 1,
            step: 0.05,
            description: 'Nucleus sampling parameter',
            required: false
          },
          {
            name: 'top_k',
            label: 'Top K',
            type: 'number',
            defaultValue: 50,
            min: 0,
            max: 500,
            step: 1,
            description: 'Only sample from the top K options for each subsequent token',
            required: false
          },
          {
            name: 'stop_sequences',
            label: 'Stop Sequences',
            type: 'textarea',
            defaultValue: '[]',
            placeholder: '["\\n\\nHuman:", "Human:"]',
            description: 'Sequences that signal the model to stop generating (JSON array)',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"top_p": 0.9, "top_k": 50}',
          advanced: '{"top_p": 0.95, "top_k": 40, "stop_sequences": ["\\n\\nHuman:", "Human:"]}'
        },
        description: 'top_p, top_k, stop_sequences'
      }
    },
  ],
  'stability': [
    { 
      name: 'Stable Diffusion', 
      versions: ['XL', '2.1', '3'],
      compatibleTypes: ['image-generation'],
      parameters: {
        common: [
          {
            name: 'prompt',
            label: 'Prompt',
            type: 'textarea',
            defaultValue: '',
            placeholder: 'A detailed description of the image you want to generate',
            description: 'Detailed text description of the desired image',
            required: true
          },
          {
            name: 'height',
            label: 'Image Height',
            type: 'number',
            defaultValue: 512,
            min: 256,
            max: 1024,
            step: 64,
            description: 'Height of the generated image in pixels',
            required: false
          },
          {
            name: 'width',
            label: 'Image Width',
            type: 'number',
            defaultValue: 512,
            min: 256,
            max: 1024,
            step: 64,
            description: 'Width of the generated image in pixels',
            required: false
          }
        ],
        advanced: [
          {
            name: 'guidance_scale',
            label: 'Guidance Scale',
            type: 'number',
            defaultValue: 7.5,
            min: 1,
            max: 20,
            step: 0.5,
            description: 'Controls how closely the image follows the prompt',
            required: false
          },
          {
            name: 'num_inference_steps',
            label: 'Inference Steps',
            type: 'number',
            defaultValue: 30,
            min: 10,
            max: 150,
            step: 1,
            description: 'Number of denoising steps (more = higher quality but slower)',
            required: false
          },
          {
            name: 'seed',
            label: 'Seed',
            type: 'number',
            defaultValue: -1,
            min: -1,
            max: 2147483647,
            step: 1,
            description: 'Random seed for reproducible images (-1 for random)',
            required: false
          },
          {
            name: 'negative_prompt',
            label: 'Negative Prompt',
            type: 'textarea',
            defaultValue: '',
            placeholder: 'Elements you want to avoid in the generated image',
            description: 'Elements to avoid in the generated image',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"guidance_scale": 7.5, "num_inference_steps": 30}',
          advanced: '{"guidance_scale": 7.5, "num_inference_steps": 50, "seed": 42, "negative_prompt": "blurry, bad quality"}'
        },
        description: 'guidance_scale, num_inference_steps, seed, negative_prompt'
      }
    },
  ],
  'google': [
    { 
      name: 'Gemini', 
      versions: ['Pro', 'Ultra'],
      compatibleTypes: ['text-generation', 'chat', 'function-calling'],
      parameters: {
        common: [
          {
            name: 'max_output_tokens',
            label: 'Max Output Tokens',
            type: 'number',
            defaultValue: 2048,
            min: 1,
            max: 8192,
            step: 1,
            description: 'Maximum number of tokens to generate',
            required: true
          },
          {
            name: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.7,
            min: 0,
            max: 1,
            step: 0.1,
            description: 'Controls randomness (0-1, lower = more deterministic)',
            required: true
          }
        ],
        advanced: [
          {
            name: 'top_p',
            label: 'Top P',
            type: 'number',
            defaultValue: 0.95,
            min: 0,
            max: 1,
            step: 0.05,
            description: 'Nucleus sampling parameter',
            required: false
          },
          {
            name: 'top_k',
            label: 'Top K',
            type: 'number',
            defaultValue: 40,
            min: 0,
            max: 100,
            step: 1,
            description: 'Only sample from the top K options for each subsequent token',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"top_p": 0.9, "top_k": 40}',
          advanced: '{"top_p": 0.95, "top_k": 40, "temperature": 0.8, "max_output_tokens": 1024}'
        },
        description: 'top_p, top_k, max_output_tokens'
      }
    },
    { 
      name: 'PaLM', 
      versions: ['2'],
      compatibleTypes: ['text-generation', 'chat'],
      parameters: {
        common: [
          {
            name: 'max_output_tokens',
            label: 'Max Output Tokens',
            type: 'number',
            defaultValue: 1024,
            min: 1,
            max: 2048,
            step: 1,
            description: 'Maximum number of tokens to generate',
            required: true
          },
          {
            name: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.7,
            min: 0,
            max: 1,
            step: 0.1,
            description: 'Controls randomness (0-1, lower = more deterministic)',
            required: true
          }
        ],
        advanced: [
          {
            name: 'top_p',
            label: 'Top P',
            type: 'number',
            defaultValue: 0.9,
            min: 0,
            max: 1,
            step: 0.05,
            description: 'Nucleus sampling parameter',
            required: false
          },
          {
            name: 'top_k',
            label: 'Top K',
            type: 'number',
            defaultValue: 40,
            min: 0,
            max: 100,
            step: 1,
            description: 'Only sample from the top K options for each subsequent token',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"top_p": 0.9, "top_k": 40}',
          advanced: '{"top_p": 0.92, "top_k": 40, "temperature": 0.7}'
        },
        description: 'top_p, top_k, temperature'
      }
    },
    { 
      name: 'Embedding', 
      versions: ['001'],
      compatibleTypes: ['embeddings'],
      parameters: {
        common: [
          {
            name: 'dimensions',
            label: 'Embedding Dimensions',
            type: 'number',
            defaultValue: 768,
            min: 1,
            max: 768,
            step: 1,
            description: 'Number of dimensions for the embedding vectors',
            required: true
          }
        ],
        advanced: [
          {
            name: 'task_type',
            label: 'Task Type',
            type: 'select',
            options: [
              { value: 'retrieval_query', label: 'Retrieval Query' },
              { value: 'retrieval_document', label: 'Retrieval Document' },
              { value: 'semantic_similarity', label: 'Semantic Similarity' },
              { value: 'classification', label: 'Classification' }
            ],
            defaultValue: 'retrieval_query',
            description: 'The intended use case for the embeddings',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"dimensions": 768}'
        },
        description: 'dimensions, task_type'
      }
    },
  ],
  'meta': [
    { 
      name: 'Llama', 
      versions: ['2', '3', '3-70b', '3-8b'],
      compatibleTypes: ['text-generation', 'chat'],
      parameters: {
        common: [
          {
            name: 'max_gen_len',
            label: 'Max Generation Length',
            type: 'number',
            defaultValue: 512,
            min: 1,
            max: 2048,
            step: 1,
            description: 'Maximum number of tokens to generate',
            required: true
          },
          {
            name: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.7,
            min: 0,
            max: 1,
            step: 0.1,
            description: 'Controls randomness (0-1, lower = more deterministic)',
            required: true
          }
        ],
        advanced: [
          {
            name: 'top_p',
            label: 'Top P',
            type: 'number',
            defaultValue: 0.9,
            min: 0,
            max: 1,
            step: 0.05,
            description: 'Nucleus sampling parameter',
            required: false
          },
          {
            name: 'repetition_penalty',
            label: 'Repetition Penalty',
            type: 'number',
            defaultValue: 1.2,
            min: 1,
            max: 2,
            step: 0.05,
            description: 'Penalizes repetitions (higher values = less repetition)',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"top_p": 0.9, "repetition_penalty": 1.2}',
          advanced: '{"top_p": 0.95, "repetition_penalty": 1.2, "temperature": 0.7, "max_gen_len": 512}'
        },
        description: 'top_p, repetition_penalty, temperature, max_gen_len'
      }
    },
  ],
  'custom': [
    { 
      name: 'Custom Model', 
      versions: ['1.0'],
      compatibleTypes: ['text-generation', 'image-generation', 'embeddings', 'classification', 'chat', 'function-calling', 'custom'],
      parameters: {
        common: [
          {
            name: 'max_tokens',
            label: 'Max Tokens',
            type: 'number',
            defaultValue: 2048,
            min: 1,
            max: 10000,
            step: 1,
            description: 'Maximum number of tokens for completion/generation',
            required: false
          },
          {
            name: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.7,
            min: 0,
            max: 2,
            step: 0.1,
            description: 'Controls randomness (lower = more deterministic)',
            required: false
          }
        ],
        advanced: [
          {
            name: 'custom_param_1',
            label: 'Custom Parameter 1',
            type: 'text',
            defaultValue: '',
            placeholder: 'Parameter name or value',
            description: 'Custom parameter specific to your model',
            required: false
          },
          {
            name: 'custom_param_2',
            label: 'Custom Parameter 2',
            type: 'text',
            defaultValue: '',
            placeholder: 'Parameter name or value',
            description: 'Custom parameter specific to your model',
            required: false
          },
          {
            name: 'custom_param_3',
            label: 'Custom Parameter 3',
            type: 'text',
            defaultValue: '',
            placeholder: 'Parameter name or value',
            description: 'Custom parameter specific to your model',
            required: false
          }
        ]
      },
      customParameterHints: {
        examples: {
          basic: '{"your_param": "value"}',
          advanced: '{"your_param1": "value1", "your_param2": "value2", "your_numeric_param": 0.5}'
        },
        description: 'Add your custom model parameters here'
      }
    },
  ]
};

// All available model types
const MODEL_TYPES = [
  { value: 'text-generation', label: 'Text Generation' },
  { value: 'image-generation', label: 'Image Generation' },
  { value: 'embeddings', label: 'Embeddings' },
  { value: 'classification', label: 'Classification' },
  { value: 'chat', label: 'Conversational' },
  { value: 'function-calling', label: 'Function Calling' },
  { value: 'custom', label: 'Custom' },
];

export async function GET() {
  // In a real application, you would fetch this data from a database or external API
  return NextResponse.json({
    models: AVAILABLE_MODELS,
    modelTypes: MODEL_TYPES
  });
} 