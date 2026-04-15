import { get, post } from '../request'
import type {
  ProposalListItem,
  ProposalDetail,
  CreateProposalRequest,
  VoteRequest,
  MyVote,
  VoteResult
} from '../types'

// ==================== 提案投票 API ====================

/** 获取提案列表 */
export function getProposalList(status?: number) {
  const params = status !== undefined ? { status } : undefined
  return get<ProposalListItem[]>('/proposals', params)
}

/** 获取提案详情 */
export function getProposalDetail(id: number) {
  return get<ProposalDetail>(`/proposals/${id}`)
}

/** 创建提案 */
export function createProposal(data: CreateProposalRequest, memberId?: number) {
  const config = memberId
    ? { headers: { 'X-Member-Id': memberId } }
    : undefined
  return post<{ id: number }>('/proposals', data, config)
}

/** 投票 */
export function vote(
  proposalId: string | number,
  data: VoteRequest,
  memberId?: number
) {
  const config = memberId
    ? { headers: { 'X-Member-Id': memberId } }
    : undefined
  return post<string>(`/proposals/${proposalId}/vote`, data, config)
}

/** 结束投票 */
export function endVote(proposalId: string | number, memberId?: number) {
  const config = memberId
    ? { headers: { 'X-Member-Id': memberId } }
    : undefined
  return post<object>(`/proposals/${proposalId}/end`, undefined, config)
}

/** 查看我的投票 */
export function getMyVote(proposalId: number, memberId?: number) {
  const config = memberId
    ? { headers: { 'X-Member-Id': memberId } }
    : undefined
  return get<MyVote[]>(`/proposals/${proposalId}/my-vote`, undefined, config)
}

/** 查看投票结果 */
export function getVoteResult(proposalId: number) {
  return get<VoteResult>(`/proposals/${proposalId}/result`)
}
