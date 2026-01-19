/**
 * 核心类型定义
 * 作用：全项目唯一的“语言标准”，确保前后端数据流向清晰
 */

// 1. 原子标签基础定义（资产库中的原材料）
export interface Atom {
  id: number
  name: string     // 技术标识，对应后端的 field，如 'register_time'
  label: string    // 中文显示名，如 '注册时间'
}

// 2. 画布中已配置的原子（带运算符和数值）
export interface ActiveTag extends Atom {
  activeId: number // 在画布中的唯一标识，防止重复
  operator: string // 运算符：>, <, =, in 等
  value: string    // 用户填写的过滤值
}

// 3. 策略组结构（画布的核心逻辑块）
export interface Group {
  id: number
  logic: 'AND' | 'OR' // 组内逻辑：且/或
  tags: ActiveTag[]   // 包含的原子配置
}

// 4. 右侧存档记录结构（对接后端接口后的完整对象）
export interface ArchiveRecord {
  id: string
  title: string
  tableName: string   // 数据源系统标识
  isActive: boolean   // 标签是否启用
  totalCount: number  // 关键：后端返回的总人数（数字类型，防止渲染报错）
  coverage: string    // 业务指标：覆盖率
  createdAt: string   // 保存时间
  logicData: Group[]  // 核心：保存时的画布完整快照，用于点击还原
}
