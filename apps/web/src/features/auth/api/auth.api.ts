import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from "@trend/shared-types";
import { api } from "@/services/api-client";
import { API_ROUTES } from "@/constants";

export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post(API_ROUTES.auth.register, payload);
    return res.data.data;
  },
  async login(payload: LoginRequest): Promise<AuthResponse> {
    // Mock login for khoakiki123
    if (payload.email === "khoakiki123" && payload.password === "khoakiki123") {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            user: {
              id: "mock-id-123",
              email: "khoakiki123@mock.com",
              fullName: "Khoa Kiki",
              role: "student",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            tokens: {
              accessToken: "mock-access-token",
              refreshToken: "mock-refresh-token",
              accessTokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
            }
          });
        }, 1000);
      });
    }

    const res = await api.post(API_ROUTES.auth.login, payload);
    return res.data.data;
  },
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await api.post(API_ROUTES.auth.refresh, { refreshToken });
    return res.data.data;
  },
  async logout(refreshToken: string): Promise<void> {
    await api.post(API_ROUTES.auth.logout, { refreshToken });
  },
  async me(): Promise<{ user: User }> {
    const res = await api.get(API_ROUTES.auth.me);
    return res.data.data;
  },
};
