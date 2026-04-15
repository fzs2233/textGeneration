// ==================== 成员模块类型 ====================

/** 成员信息 */
export interface Member {
  id: number
  username: string
  password: string | null
  realName: string
  email: string
  phone: string
  roleId: number
  registerTime: string
  status: number // 0-禁用, 1-正常
}

/** 登录请求参数 */
export interface LoginRequest {
  username: string
  password: string
}

/** 登录响应 */
export interface LoginResponse {
  token: string
  memberId: number
  member?: Member
}

/** 注册请求参数 */
export interface RegisterRequest {
  username: string
  password: string
  realName: string
  email: string
  phone: string
}

/** 更新成员信息请求参数 */
export interface UpdateMemberRequest {
  username?: string
  realName?: string
  email?: string
  phone?: string
}

/** 修改角色请求参数 */
export interface UpdateRoleRequest {
  roleId: number
}

// ==================== 提案模块类型 ====================

/** 提案状态枚举 */
export enum ProposalStatus {
  DRAFT = 0,      // 草稿
  ACTIVE = 1,     // 进行中
  ENDED = 2       // 已结束
}

/** 提案列表项 */
export interface ProposalListItem {
  id: number
  title: string
  description: string
  proposerId: number
  voteType: number // 1-单选, 2-多选
  maxChoices: number
  winnersCount: number
  status: number // 0-草稿, 1-进行中, 2-已结束
  startTime: string
  endTime: string
  createTime: string
}

/** 提案详情 */
export interface ProposalDetail {
  proposal: {
    id: number
    title: string
    description: string
    proposerId: number
    voteType: number
    maxChoices: number
    winnersCount: number
    status: number
    startTime: string
    endTime: string
    createTime: string
  }
  options: ProposalOption[]
}

/** 提案选项 */
export interface ProposalOption {
  id: number
  optionText: string
  voteCount?: number
}

/** 创建提案请求参数 */
export interface CreateProposalRequest {
  title: string
  description: string
  voteType: number // 1-单选, 2-多选
  maxChoices: number
  winnersCount: number // 获胜选项数量
  options: string[]
}

/** 投票请求参数 */
export interface VoteRequest {
  optionIds: number[]
}

/** 我的投票记录 */
export interface MyVote {
  id: number
  optionId: number
  optionContent: string
  voteTime: string
}

/** 投票结果选项 */
export interface VoteResultOption {
  id: number
  proposalId: number
  optionText: string
  optionOrder: number
  voteCount: number
  createdAt: string
}

/** 投票结果 */
export interface VoteResult {
  proposal: {
    id: number
    title: string
    description: string
    proposerId: number
    voteType: number
    maxChoices: number
    winnersCount: number
    status: number
    startTime: string
    endTime: string | null
    createTime: string
  }
  winners: VoteResultOption[]
  results: VoteResultOption[]
}
