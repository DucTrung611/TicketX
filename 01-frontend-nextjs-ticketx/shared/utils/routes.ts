export const ROUTES = {
  home: '/',
  movies: '/movies',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: (email?: string) =>
    email ? `/reset-password?email=${encodeURIComponent(email)}` : '/reset-password',
  myBookings: '/my-bookings',
  cinemas: '/cinemas',
  showtimes: '/showtimes',
  profile: '/profile',
  checkin: '/checkin',
  ticket: (bookingId: string) => `/tickets/${bookingId}`,
  admin: '/admin',
  adminMovies: '/admin/movies',
  adminCinemas: '/admin/cinemas',
  adminCinemaSeats: (cinemaId: string, roomId: string) =>
    `/admin/cinemas/${cinemaId}/rooms/${roomId}/seats`,
  adminShowtimes: '/admin/showtimes',
  adminCombos: '/admin/combos',
  adminVouchers: '/admin/vouchers',
} as const;
