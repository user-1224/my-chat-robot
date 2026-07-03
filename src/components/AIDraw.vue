<template>
  <div class="container">
    <h2>AI 文生图绘图</h2>
    <textarea v-model="prompt" placeholder="输入图片描述" rows="3"></textarea>
    <button @click="createImg" :disabled="loading">
      {{ loading ? '生成中...' : '生成图片' }}
    </button>

    <!-- 预览图 -->
    <div v-if="imgUrl">
      <img :src="imgUrl" style="max-width:300px" alt="">
      <button @click="download">下载图片</button>
    </div>

    <!-- 历史记录 -->
    <div class="history">
      <h4>历史记录</h4>
      <div v-for="item in historyList" :key="item.time">
        <p>提示词：{{ item.prompt }}</p>
        <img :src="item.imageUrl" width="120">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateImage } from '../api/drawApi'

// 把原来的类型定义直接写在组件内部，不用新建文件夹
interface ImageMessage {
  type: 'text' | 'image'
  imageUrl?: string
  prompt?: string
  time: string
}

const prompt = ref('')
const imgUrl = ref('')
const loading = ref(false)
const historyList = ref<ImageMessage[]>([])

// 读取本地历史
onMounted(() => {
  const local = localStorage.getItem('ai_history')
  if (local) {
    historyList.value = JSON.parse(local)
  }
})

// 生成图片
async function createImg() {
  if (!prompt.value) return
  loading.value = true
  try {
    const url = await generateImage(prompt.value)
    imgUrl.value = url

    const record: ImageMessage = {
      type: 'image',
      prompt: prompt.value,
      imageUrl: url,
      time: new Date().getTime().toString()
    }

    historyList.value.unshift(record)
    localStorage.setItem('ai_history', JSON.stringify(historyList.value))
  } catch (e) {
    alert('生成失败')
    console.log(e)
  } finally {
    loading.value = false
  }
}

// 下载图片
function download() {
  const a = document.createElement('a')
  a.href = imgUrl.value
  a.download = 'ai_pic_' + Date.now() + '.png'
  a.click()
}
</script>

<style scoped>
.container{
  max-width: 600px;
  margin: 20px auto;
}
textarea{
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}
button{
  padding: 8px 16px;
  background: #4096ff;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>