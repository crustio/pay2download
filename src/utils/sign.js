export const sign = (data, account) => {
  const msg = Buffer.from(data, 'utf8').toString('hex');

  if (!window.ethereum?.request)
    return Promise.reject("Error")
  return window.ethereum?.request({
    from: account,
    params: [msg, account],
    method: 'personal_sign'
  }).then((signature) => {
    console.info('signData:', signature);
    return signature;
  });
}