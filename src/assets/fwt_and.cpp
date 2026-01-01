void fwt_and(LL *f, LL tag) {
  for (LL j = 1; j < n; j <<= 1)
    for (LL i = 0; i < n; i += j << 1)
      for (LL k = i; k < i + j; k++)
        f[k] = (f[k] + f[k + j] * tag) % P;
  FOR(i, 0, n - 1) f[i] += f[i] < 0 ? P : 0;
}