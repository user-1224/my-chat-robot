export async function generateImage(prompt: string) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  // 根据提示词生成唯一seed
  const seed = btoa(prompt)
  return `https://picsum.photos/seed/${seed}/1024/1024`
}