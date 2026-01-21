import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ApiResponse,
  UserResponse,
  UserRequest,
  AccountStatus,
  Role,
} from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService {
  getUserById(id: string): Observable<ApiResponse<UserResponse>> {
    return this.get<ApiResponse<UserResponse>>(`/user/${id}`);
  }

  getUserByEmail(email: string): Observable<ApiResponse<UserResponse>> {
    return this.get<ApiResponse<UserResponse>>(`/user/email/${email}`);
  }

  getAllUsers(): Observable<ApiResponse<UserResponse[]>> {
    return this.get<ApiResponse<UserResponse[]>>('/user');
  }

  updateUserProfile(id: string, request: UserRequest): Observable<ApiResponse<UserResponse>> {
    return this.put<ApiResponse<UserResponse>>(`/user/${id}`, request);
  }

  changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Observable<ApiResponse<UserResponse>> {
    return this.put<ApiResponse<UserResponse>>(
      `/user/${id}/password?oldPassword=${oldPassword}&newPassword=${newPassword}`,
      {}
    );
  }

  uploadAvatar(id: string, file: File): Observable<ApiResponse<UserResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.uploadFile<ApiResponse<UserResponse>>(`/user/${id}/avatar`, formData);
  }

  updateAccountStatus(id: string, status: AccountStatus): Observable<ApiResponse<UserResponse>> {
    return this.put<ApiResponse<UserResponse>>(`/user/${id}/status?status=${status}`, {});
  }

  updateUserRole(id: string, role: Role): Observable<ApiResponse<UserResponse>> {
    return this.put<ApiResponse<UserResponse>>(`/user/${id}/role?role=${role}`, {});
  }

  deleteUser(id: string): Observable<ApiResponse<string>> {
    return this.delete<ApiResponse<string>>(`/user/${id}`);
  }
}
