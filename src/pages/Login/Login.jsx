import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { login } from "../../api/authapi";
import { useStore } from "../../store/store";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useStore((s) => s.auth);
  const setAuth = useStore((s) => s.setAuth);
  // RequireAuth passes the page to come back to in state.from
  const redirectTo = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: "", password: "" } });

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      setAuth({ token, user });
      toast.success(`Welcome, ${user?.username}`);
      navigate(redirectTo, { replace: true });
    },
  });

  if (auth) return <Navigate to={redirectTo} replace />;

  const errorMessage =
    error &&
    (error.response?.data?.message ||
      (error.response?.status === 401
        ? "Invalid username or password"
        : "Could not log in, please try again"));

  return (
    <Box sx={{ display: "flex", justifyContent: "center", px: 2, flexGrow: 1 }}>
      <Paper
        component="form"
        noValidate
        onSubmit={handleSubmit((values) => mutate(values))}
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignSelf: "flex-start",
        }}
      >
        <Typography variant="h5" component="h1" textAlign="center">
          Log in
        </Typography>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <TextField
          label="Username"
          autoComplete="username"
          autoFocus
          fullWidth
          {...register("username", { required: "Username is required" })}
          error={!!errors.username}
          helperText={errors.username?.message}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          fullWidth
          {...register("password", { required: "Password is required" })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isPending}
          startIcon={isPending && <CircularProgress size={18} />}
        >
          Log in
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
