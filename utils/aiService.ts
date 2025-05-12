import { Platform } from 'react-native';

interface AIRequestOptions {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
  }>;
}

export async function generateText(options: AIRequestOptions): Promise<string> {
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

export async function generateStory(topic: string, heroName: string, ageGroup: string): Promise<string> {
  const prompt = `
    أنشئ قصة تعليمية للأطفال عن "${topic}" مع شخصية رئيسية اسمها "${heroName}".
    القصة يجب أن تكون مناسبة للفئة العمرية ${ageGroup}.
    اجعل القصة ممتعة وتعليمية وتحتوي على دروس أخلاقية.
    اكتب القصة باللغة العربية الفصحى البسيطة.
    اجعل القصة بين 300-500 كلمة.
  `;

  const messages = [
    {
      role: 'system' as const,
      content: 'أنت مساعد متخصص في كتابة قصص تعليمية للأطفال باللغة العربية. تكتب قصصًا ممتعة وهادفة تناسب الفئة العمرية المحددة.'
    },
    {
      role: 'user' as const,
      content: prompt
    }
  ];

  return generateText({ messages });
}

export async function generateDynamicActivity(storyContent: string, activityType: string): Promise<any> {
  let systemPrompt = 'أنت مساعد متخصص في تصميم أنشطة تعليمية تفاعلية للأطفال باللغة العربية. تقوم بإنشاء أنشطة منظمة بتنسيق JSON.';
  let userPrompt = '';
  
  switch (activityType) {
    case 'matching':
      userPrompt = `
        بناءً على القصة التالية، قم بإنشاء نشاط توصيل تعليمي للأطفال:
        
        ${storyContent}
        
        أنشئ 5-8 أزواج من العناصر للتوصيل بينها. يجب أن تكون مرتبطة بالقصة ومناسبة للأطفال.
        
        قم بإرجاع البيانات بتنسيق JSON فقط بالشكل التالي:
        {
          "title": "عنوان النشاط",
          "instructions": "تعليمات للطفل حول كيفية إكمال النشاط",
          "pairs": [
            { "id": 1, "left": "عنصر في العمود الأيمن", "right": "ما يناسبه في العمود الأيسر" },
            { "id": 2, "left": "عنصر آخر", "right": "ما يناسبه" }
          ]
        }
      `;
      break;
      
    case 'truefalse':
      userPrompt = `
        بناءً على القصة التالية، قم بإنشاء نشاط صح أو خطأ تعليمي للأطفال:
        
        ${storyContent}
        
        أنشئ 5-8 عبارات يجب على الطفل تحديد ما إذا كانت صحيحة أم خاطئة. يجب أن تكون مرتبطة بالقصة ومناسبة للأطفال.
        
        قم بإرجاع البيانات بتنسيق JSON فقط بالشكل التالي:
        {
          "title": "عنوان النشاط",
          "instructions": "تعليمات للطفل حول كيفية إكمال النشاط",
          "questions": [
            { "id": 1, "text": "العبارة الأولى", "answer": true },
            { "id": 2, "text": "العبارة الثانية", "answer": false }
          ]
        }
      `;
      break;
      
    case 'fillblanks':
      userPrompt = `
        بناءً على القصة التالية، قم بإنشاء نشاط ملء الفراغات تعليمي للأطفال:
        
        ${storyContent}
        
        أنشئ 5-8 جمل بها فراغات يجب على الطفل ملؤها. لكل فراغ، قدم 4 خيارات محتملة مع تحديد الإجابة الصحيحة.
        يجب أن تكون الجمل مرتبطة بالقصة ومناسبة للأطفال.
        
        قم بإرجاع البيانات بتنسيق JSON فقط بالشكل التالي:
        {
          "title": "عنوان النشاط",
          "instructions": "تعليمات للطفل حول كيفية إكمال النشاط",
          "sentences": [
            { 
              "id": 1, 
              "text": "الجملة الأولى مع فراغ _____", 
              "answer": "الإجابة الصحيحة",
              "options": ["الإجابة الصحيحة", "خيار خاطئ 1", "خيار خاطئ 2", "خيار خاطئ 3"]
            },
            { 
              "id": 2, 
              "text": "الجملة الثانية مع فراغ _____", 
              "answer": "الإجابة الصحيحة",
              "options": ["الإجابة الصحيحة", "خيار خاطئ 1", "خيار خاطئ 2", "خيار خاطئ 3"]
            }
          ]
        }
      `;
      break;
      
    case 'multiplechoice':
      userPrompt = `
        بناءً على القصة التالية، قم بإنشاء نشاط اختيار من متعدد تعليمي للأطفال:
        
        ${storyContent}
        
        أنشئ 5-8 أسئلة اختيار من متعدد مع 4 خيارات لكل سؤال. يجب أن تكون الأسئلة مرتبطة بالقصة ومناسبة للأطفال.
        
        قم بإرجاع البيانات بتنسيق JSON فقط بالشكل التالي:
        {
          "title": "عنوان النشاط",
          "instructions": "تعليمات للطفل حول كيفية إكمال النشاط",
          "questions": [
            { 
              "id": 1, 
              "text": "السؤال الأول؟", 
              "options": ["الإجابة الصحيحة", "خيار خاطئ 1", "خيار خاطئ 2", "خيار خاطئ 3"],
              "answer": "الإجابة الصحيحة"
            },
            { 
              "id": 2, 
              "text": "السؤال الثاني؟", 
              "options": ["الإجابة الصحيحة", "خيار خاطئ 1", "خيار خاطئ 2", "خيار خاطئ 3"],
              "answer": "الإجابة الصحيحة"
            }
          ]
        }
      `;
      break;
      
    default:
      userPrompt = `
        بناءً على القصة التالية، قم بإنشاء نشاط تعليمي للأطفال من نوع "${activityType}":
        
        ${storyContent}
        
        قم بإنشاء نشاط تفاعلي مناسب للأطفال ومرتبط بالقصة.
        
        قم بإرجاع البيانات بتنسيق JSON فقط بالشكل المناسب لنوع النشاط.
      `;
  }

  const messages = [
    {
      role: 'system' as const,
      content: systemPrompt
    },
    {
      role: 'user' as const,
      content: userPrompt
    }
  ];

  try {
    const response = await generateText({ messages });
    
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      return JSON.parse(jsonString);
    } else {
      throw new Error("Could not extract JSON from AI response");
    }
  } catch (error) {
    console.error('Error generating dynamic activity:', error);
    
    // Fallback to default structure if JSON parsing fails
    return {
      title: `نشاط ${activityType} تعليمي`,
      instructions: "أكمل النشاط التالي المرتبط بالقصة",
      content: response
    };
  }
}

export async function generateActivityIdeas(storyContent: string, activityType: string): Promise<string> {
  const prompt = `
    بناءً على القصة التالية، اقترح ${activityType} تعليمي مناسب للأطفال:
    
    ${storyContent}
    
    قدم تفاصيل كاملة للنشاط بما في ذلك الأسئلة والإجابات إن وجدت.
    اجعل النشاط مرتبطًا بشكل مباشر بموضوع القصة وشخصياتها.
  `;

  const messages = [
    {
      role: 'system' as const,
      content: 'أنت مساعد متخصص في تصميم أنشطة تعليمية للأطفال باللغة العربية. تصمم أنشطة مبتكرة ومرتبطة بالقصص التعليمية.'
    },
    {
      role: 'user' as const,
      content: prompt
    }
  ];

  return generateText({ messages });
}

export async function generateImagePrompt(storyContent: string, scene: string): Promise<string> {
  const prompt = `
    بناءً على القصة التالية والمشهد المحدد، اكتب وصفًا تفصيليًا باللغة الإنجليزية يمكن استخدامه لتوليد صورة:
    
    القصة: ${storyContent}
    
    المشهد: ${scene}
    
    اكتب وصفًا تفصيليًا للصورة بالإنجليزية (لأن مولدات الصور تعمل بشكل أفضل باللغة الإنجليزية).
    ركز على الشخصيات والمشهد والألوان والتفاصيل المهمة.
    اجعل الوصف مناسبًا للأطفال وبأسلوب رسوم متحركة جميل.
  `;

  const messages = [
    {
      role: 'system' as const,
      content: 'أنت مساعد متخصص في كتابة أوصاف دقيقة للصور بناءً على قصص للأطفال. تكتب أوصافًا تفصيلية باللغة الإنجليزية لتوليد صور جذابة ومناسبة للأطفال.'
    },
    {
      role: 'user' as const,
      content: prompt
    }
  ];

  return generateText({ messages });
}

export async function generateColoringImage(storyContent: string, character: string): Promise<string> {
  const prompt = `
    Based on the following children's story, create a detailed prompt for generating a simple, 
    flat, black and white line drawing suitable for a coloring page featuring the character or scene described:
    
    Story: ${storyContent}
    
    Character/Scene: ${character}
    
    The prompt should describe a simple, clear outline drawing with:
    - Clean, distinct lines
    - No shading or complex textures
    - Child-friendly content
    - Simple background elements
    - Focus on the main character/scene
    - Suitable for printing as a coloring page
    
    Write the prompt in English, optimized for generating a coloring page illustration.
  `;

  const messages = [
    {
      role: 'system' as const,
      content: 'You are a specialist in creating prompts for generating children\'s coloring book illustrations. You create detailed descriptions that result in simple, clear line drawings suitable for children to color.'
    },
    {
      role: 'user' as const,
      content: prompt
    }
  ];

  return generateText({ messages });
}