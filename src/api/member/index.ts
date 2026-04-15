import { get, post, put, del } from '../request'
import type { Member, RegisterRequest, UpdateMemberRequest, UpdateRoleRequest, LoginRequest, LoginResponse } from '../types'

// ==================== 成员管理 API ====================

/** 成员登录 */
export function login(data: LoginRequest) {
  return post<LoginResponse>('/members/login', data)
}

/** 获取所有成员列表 */
export function getMemberList() {
  return get<Member[]>('/members')
}

/** 根据 ID 获取成员信息 */
export function getMemberById(id: string | number) {
  return get<Member>(`/members/${id}`)
}

/** 成员注册 */
export function register(data: RegisterRequest) {
  return post<Member>('/members/register', data)
}

/** 更新成员信息 */
export function updateMember(id: string | number, data: UpdateMemberRequest) {
  return put<string>(`/members/${id}`, data)
}

/** 修改成员角色 */
export function updateMemberRole(
  id: string | number,
  data: UpdateRoleRequest,
  operatorId?: number,
) {
  const config = operatorId ? { headers: { 'X-Member-Id': operatorId } } : undefined
  return put<string>(`/members/${id}/role`, data, config)
}

/** 删除成员 */
export function deleteMember(id: string | number) {
  return del<string>(`/members/${id}`)
}
