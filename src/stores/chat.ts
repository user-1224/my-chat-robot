import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { sendChatMessage, ChatMessage } from '@/api/chat'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  thinking?: string[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversationId = ref<string | null>(null)
  const isGenerating = ref(false)
  const thinkingModeEnabled = ref(false)
  const abortController = ref<AbortController | null>(null)

  function toggleThinkingMode() {
    thinkingModeEnabled.value = !thinkingModeEnabled.value
  }

  function stopGenerating() {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  const currentConversation = computed(() => {
    return conversations.value.find(c => c.id === currentConversationId.value) || null
  })

  function createConversation(title: string = '新对话'): string {
    const id = uuidv4()
    const conversation: Conversation = {
      id,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    conversations.value.unshift(conversation)
    currentConversationId.value = id
    return id
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      if (currentConversationId.value === id) {
        currentConversationId.value = conversations.value[0]?.id || null
      }
    }
  }

  function switchConversation(id: string) {
    const conversation = conversations.value.find(c => c.id === id)
    if (conversation) {
      currentConversationId.value = id
    }
  }

  function extractKeywords(text: string): string[] {
    const keywords: string[] = []
    const patterns = [
      /(学习|教程|入门|掌握|精通)/g,
      /(编程|代码|Python|Java|Vue|React|前端|后端)/g,
      /(问题|错误|bug|报错|解决)/g,
      /(写|生成|创建|设计|开发)/g,
      /(解释|说明|什么是|为什么|如何)/g,
      /(推荐|建议|选择|比较)/g,
      /(AI|人工智能|大模型|ChatGPT|豆包)/g,
      /(历史|科学|技术|数学|物理|化学|生物)/g,
      /(旅游|美食|健康|教育|职场)/g,
    ]
    
    for (const pattern of patterns) {
      const matches = text.match(pattern)
      if (matches) {
        keywords.push(...matches.slice(0, 2))
      }
    }
    
    return [...new Set(keywords)].slice(0, 4)
  }

  function analyzeQuestion(userMessage: string): string {
    const target = userMessage.match(/(学校|专业|学科|大学|学院|专业)/)?.[0] || '该话题'
    const aspect = userMessage.match(/(实力|水平|排名|特点|优势|特色)/)?.[0] || '相关信息'
    return `${target}的${aspect}`
  }

  function generateThinkingProcess(userMessage: string): string[] {
    const thinkingSteps: string[] = []
    const keywords = extractKeywords(userMessage)
    const analysis = analyzeQuestion(userMessage)
    
    thinkingSteps.push(`分析问题：${userMessage.slice(0, 40)}${userMessage.length > 40 ? '...' : ''}`)
    
    if (userMessage.includes('吗') || userMessage.includes('？') || userMessage.includes('?')) {
      thinkingSteps.push('识别这是一个是非类问题，需要明确回答是或否')
    } else if (userMessage.includes('写') || userMessage.includes('生成') || userMessage.includes('创建')) {
      thinkingSteps.push('识别这是一个创作类请求，需要生成原创内容')
    } else if (userMessage.includes('解释') || userMessage.includes('什么') || userMessage.includes('如何')) {
      thinkingSteps.push('识别这是一个解释说明类请求，需要详细阐述概念')
    } else if (userMessage.includes('推荐') || userMessage.includes('建议')) {
      thinkingSteps.push('识别这是一个推荐建议类请求，需要提供专业建议')
    } else if (userMessage.includes('bug') || userMessage.includes('错误') || userMessage.includes('报错')) {
      thinkingSteps.push('识别这是一个技术问题，需要分析错误原因')
    } else if (userMessage.includes('怎么样') || userMessage.includes('如何') || userMessage.includes('特点')) {
      thinkingSteps.push(`识别这是一个评价分析类请求，需要分析${analysis}`)
    } else {
      thinkingSteps.push('分析用户意图和潜在需求...')
    }
    
    if (keywords.length > 0) {
      thinkingSteps.push(`提取关键信息：${keywords.join('、')}`)
    } else {
      thinkingSteps.push(`聚焦核心问题：${analysis}`)
    }
    
    thinkingSteps.push(`搜索与「${analysis}」相关的知识库...`)
    
    if (keywords.length > 0) {
      thinkingSteps.push(`检索「${keywords[0]}」领域的专业资料...`)
    } else {
      thinkingSteps.push('整理相关领域的公开信息和数据...')
    }
    
    if (keywords.length > 1) {
      thinkingSteps.push(`分析「${keywords[0]}」与「${keywords[1]}」之间的关联...`)
    } else {
      thinkingSteps.push('分析问题的各个维度和层面...')
    }
    
    thinkingSteps.push('评估信息来源的可靠性和权威性...')
    thinkingSteps.push('构建结构化的回答框架...')
    thinkingSteps.push(`组织关于${analysis}的详细内容...`)
    thinkingSteps.push('确保回答逻辑清晰、层次分明...')
    thinkingSteps.push('检查是否有遗漏的重要信息...')
    thinkingSteps.push('准备输出最终回答...')
    
    return thinkingSteps
  }

  const MIN_THINKING_DURATION = 1500

  async function sendMessage(content: string) {
    if (!currentConversation.value) {
      createConversation()
    }

    if (!currentConversation.value) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now()
    }
    currentConversation.value.messages.push(userMessage)
    currentConversation.value.updatedAt = Date.now()

    if (currentConversation.value.messages.length === 1) {
      currentConversation.value.title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
    }

    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      thinking: []
    }
    currentConversation.value.messages.push(assistantMessage)

    const apiMessages: ChatMessage[] = currentConversation.value.messages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }))

    try {
      isGenerating.value = true
      abortController.value = new AbortController()

      const messagesRef = currentConversation.value.messages
      const assistantIndex = messagesRef.length - 1
      let accumulatedContent = ''

      if (thinkingModeEnabled.value) {
        const thinkingSteps = generateThinkingProcess(content)
        let thinkingIndex = 0

        const thinkingInterval = setInterval(() => {
          if (thinkingIndex < thinkingSteps.length) {
            assistantMessage.thinking = [...(assistantMessage.thinking || []), thinkingSteps[thinkingIndex]]
            thinkingIndex++
            messagesRef[assistantIndex] = { ...assistantMessage }
          }
        }, 300)

        const startTime = Date.now()
        const waitForMinDuration = new Promise(resolve => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, MIN_THINKING_DURATION - elapsed)
          setTimeout(resolve, remaining)
        })

        const sendMessagePromise = sendChatMessage(
          apiMessages,
          undefined,
          (chunk: string) => {
            accumulatedContent += chunk
          },
          abortController.value
        )

        await Promise.all([waitForMinDuration, sendMessagePromise])

        clearInterval(thinkingInterval)
        assistantMessage.thinking = []
        assistantMessage.content = accumulatedContent
        messagesRef[assistantIndex] = { ...assistantMessage }
      } else {
        await sendChatMessage(
          apiMessages,
          undefined,
          (chunk: string) => {
            assistantMessage.content += chunk
            messagesRef[assistantIndex] = { ...assistantMessage }
          },
          abortController.value
        )
      }

      assistantMessage.timestamp = Date.now()
      currentConversation.value.updatedAt = Date.now()
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('发送消息失败:', error)
        const index = currentConversation.value.messages.findIndex(m => m.id === assistantMessage.id)
        if (index !== -1) {
          currentConversation.value.messages.splice(index, 1)
        }
        throw error
      }
    } finally {
      isGenerating.value = false
      abortController.value = null
    }
  }

  function clearCurrentMessages() {
    if (currentConversation.value) {
      currentConversation.value.messages = []
      currentConversation.value.updatedAt = Date.now()
    }
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    isGenerating,
    thinkingModeEnabled,
    abortController,
    createConversation,
    deleteConversation,
    switchConversation,
    sendMessage,
    toggleThinkingMode,
    stopGenerating,
    clearCurrentMessages
  }
})
