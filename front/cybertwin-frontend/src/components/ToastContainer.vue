<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div v-for="toast in toastStore.toasts" :key="toast.id" :class="['toast', toast.type]">
        {{ toast.message }}
        <button @click="toastStore.removeToast(toast.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toastStore'
const toastStore = useToastStore()
</script>

<style scoped>
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; }
.toast { 
  background: var(--primary-color); color: white; padding: 1rem 1.5rem; 
  border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex; justify-content: space-between; align-items: center; min-width: 250px;
}
.toast.success { background: #2ecc71; }
.toast.warning { background: #f39c12; }
.toast.error { background: #e74c3c; }
.toast button { background: none; border: none; color: white; cursor: pointer; margin-left: 10px; font-weight: bold; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>