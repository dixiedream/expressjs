// Common configs
export default {
  accessToken: {
    name: 'Authorization',
    expiresInSec: 60 * 15 // 15m
  },
  refreshToken: {
    name: 'refresh_token',
    expiresInSec: 60 * 60 * 24 * 365 // 1y
  },
  passwordStrongness:
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
}
