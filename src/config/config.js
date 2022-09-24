// Common configs
const Config = {
  accessToken: {
    name: 'Authorization',
    expiresIn: 60 * 15 // 15m
  },
  refreshToken: {
    name: 'refresh_token',
    expiresIn: 60 * 60 * 24 * 365 // 1y
  },
  passwordStrongness:
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
}

module.exports = Config
