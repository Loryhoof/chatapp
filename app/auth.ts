export const refreshToken = async (): Promise<{ ok: boolean }> => {
  console.log("attempting to refresh token");

  type RefreshTokenRequest = {
    refreshToken: string;
  };

  const refTkn = localStorage.getItem("refresh_token");

  if (!refTkn) return { ok: false };

  const requestData: RefreshTokenRequest = {
    refreshToken: refTkn,
  };

  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": `application/json`,
    },
    body: JSON.stringify(requestData),
  };

  const response = await fetch("http://localhost:8080/refresh-token", options);
  const data = await response.json();

  if (data.error) {
    return { ok: false };
  }

  if (data.accessToken) {
    localStorage.setItem("access_token", data.accessToken);
  }

  if (data.refreshToken) {
    localStorage.setItem("refresh_token", data.refreshToken);
  }

  return { ok: true };
};

export const verifyToken = async (): Promise<{ ok: boolean }> => {
  const token = localStorage.getItem("access_token");

  if (!token) return { ok: false };

  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const data = await fetch("http://localhost:8080/verify-token", options);
  const response = await data.json();

  if (!response.error) {
    return { ok: true };
  }

  const refreshed = await refreshToken();
  return refreshed;
};
