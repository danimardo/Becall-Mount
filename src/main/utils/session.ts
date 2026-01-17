let password = '';
export const setSessionPassword = (p: string) => password = p;
export const getSessionPassword = () => password;
export const isSessionAuthenticated = () => !!password;
