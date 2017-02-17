module.exports = {
  internalError: { error: { type: 'internal', message: 'Internal error' } },
  entryExistsError: { error: { type: 'entry_exists', message: 'Such entry exists, wow!' } },
  notFoundError: { error: { type: 'not_found', message: 'Entry not found' } },
  tokenNotFoundError: { error: { type: 'token_not_found', message: 'Token not found' } },
  invalidParamError: { error: { type: 'invalid_parameter', message: 'Invalid param given' } },
};
