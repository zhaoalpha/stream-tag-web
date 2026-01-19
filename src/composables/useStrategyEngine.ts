/**
 * useStrategyEngine.ts
 * 职责：画布核心引擎，管理分组的增删、数据聚合及 Payload 准备
 */

import { ref } from 'vue'
import type { Group, ActiveTag } from '@/types/tag-lab' // 引用第一步定义的标准类型

// 1. 画布名称（支持双向绑定）
const tagName = ref('')

// 2. 核心状态：分组列表
const groups = ref<Group[]>([{ id: Date.now(), logic: 'AND', tags: [] }])


export function useStrategyEngine() {
  /**
   * 功能：新增策略组
   * 逻辑：确保 ID 唯一，默认逻辑为 'AND'
   */
  const addStrategyGroup = () => {
    groups.value.push({
      id: Date.now() + Math.random(),
      logic: 'AND',
      tags: [],
    })
  }

  /**
   * 功能：删除指定策略组
   * 逻辑：过滤数组，保留至少一个分组的防御性逻辑放在 UI 层处理
   */
  const removeGroup = (groupId: number) => {
    groups.value = groups.value.filter((g) => g.id !== groupId)
  }

  /**
   * 功能：更新特定组内的标签
   * 作用：处理子组件 StrategyGroup 传回的数据
   */
  const updateGroupTags = (groupId: number, newTags: ActiveTag[]) => {
    const target = groups.value.find((g) => g.id === groupId)
    if (target) {
      target.tags = newTags
    }
  }

  /**
   * 功能：准备发送给后端的 Payload
   * 逻辑：将 UI 结构转化为后端 Java 环境所需的扁平格式
   */
  const preparePayload = (tableName: string) => {
    console.log('--- 开始封装 Payload ---');
    console.log('当前标题 (tagName):', tagName.value);
    console.log('当前组数据 (groups):', groups.value);

    return {
      title: tagName.value === '请输入标签名称' ? '未命名策略' : tagName.value,
      table: tableName.toLowerCase(),
      groups: groups.value.map((group) => ({
        logic: group.logic.toLowerCase(),
        rules: group.tags.map((tag) => ({
          field: tag.name,
          operator: tag.operator,
          value: tag.value,
        })),
      })),
    }
  }

  /**
   * 功能：重置画布
   * 作用：用于点击存档回填或新建策略时清空状态
   */
  const resetCanvas = () => {
    groups.value = [{ id: Date.now(), logic: 'AND', tags: [] }]
    tagName.value = ''
  }

  return {
    tagName,
    groups,
    addStrategyGroup,
    removeGroup,
    updateGroupTags,
    preparePayload,
    resetCanvas,
  }
}
