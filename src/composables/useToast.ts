import { ref } from 'vue'

// 定义允许的状态类型
type ToastType = 'success' | 'warning' | 'error'

const isShow = ref(false)
const msg = ref('')
const toastType = ref<ToastType>('success')
let timer: number | null = null

export function useToast() {
  const show = (message: string, type: ToastType = 'success', duration = 3000) => {
    // 如果当前有正在运行的计时器，先清除
    if (timer) clearTimeout(timer)

    msg.value = message
    toastType.value = type
    isShow.value = true

    timer = window.setTimeout(() => {
      isShow.value = false
    }, duration)
  }

  // 便捷方法
  const success = (m: string) => show(m, 'success')
  const warning = (m: string) => show(m, 'warning')
  const error = (m: string) => show(m, 'error')

  return {
    isShow,
    msg,
    toastType,
    success,
    warning,
    error
  }
}
