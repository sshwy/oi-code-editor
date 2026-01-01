void fwt_or(LL *f, LL tag) {
  for (LL j = 1; j < n; j <<= 1)
    for (LL i = 0; i < n; i += j << 1)
      for (LL k = i; k < i + j; k++)
        f[k + j] = (f[k + j] + f[k] * tag) % P;
  FOR(i, 0, n - 1) f[i] += f[i] < 0 ? P : 0;
}