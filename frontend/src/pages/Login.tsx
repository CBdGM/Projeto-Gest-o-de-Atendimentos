import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post<{ access_token: string; refresh_token: string }>(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true
        }
      );

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      navigate("/"); // redireciona para dashboard ou clientes
    } catch (err) {
        console.log(err)
      setErro("Usuário ou senha inválidos.");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Paper elevation={3} sx={{ padding: 4, width: 350 }}>
        <Typography variant="h5" textAlign="center" mb={3}>
          Login
        </Typography>

        <TextField
          fullWidth
          label="Usuário"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          label="Senha"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {erro && (
          <Typography color="error" mt={1}>
            {erro}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleLogin}
        >
          Entrar
        </Button>
      </Paper>
    </Box>
  );
}
