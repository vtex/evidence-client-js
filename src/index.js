import md5 from 'md5'
import isUndefined from 'lodash/isUndefined'
import isFunction from 'lodash/isFunction'

function fetchRequest(context) {
  if (
    (!isUndefined(window) && !isFunction(window.fetch)) ||
    (!isUndefined(global) && !isFunction(global.fetch))
  ) {
    console.error('Evidence Client: Error, using fetchRequest without fetch object');
    return null;
  }

  return fetch(context.url, {
    ...context,
    body: context.data
  }).then(response => {
    if (context.responseType === 'json') {
      return response.json();
    }
    return response;
  });
}

export function generateEvidenceHash(object) {
  return md5(JSON.stringify(object))
}

const EVIDENCE_SERVER_ENDPOINT = '/api/Evidence?application=instore'

export default class EvidenceClient {
  config(config) {
    this.request = (!isUndefined(config.request) ? config.request : this.request) || fetchRequest
  }

  sendEvidence(evidence) {
    if (process.env.NODE_ENV === 'development') {
      return 'development'
    }

    let url = EVIDENCE_SERVER_ENDPOINT
    const hash = generateEvidenceHash(evidence)
    url = `${url}&hash=${hash}`

    this.request({
      url,
      data: JSON.stringify(evidence),
      timeout: 3000,
      attempts: 3,
      dataType: 'raw',
      cache: true,
      responseType: 'text',
    })

    return hash
  }
}