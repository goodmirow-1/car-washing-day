// loadtest.js
import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { check, sleep } from 'k6';

let errorRate = new Rate('error_rate')

export let options = {
    thresholds: {
        error_rate: ['rate < 0.1'],
    },
    stages: [
        { duration: '1m', target: 1500 }, 

    ]
};

export default function () {

  const payload = JSON.stringify({
    email: 'test@test.com',
    loginType: '구글'
  })

  const param = {
    headers: {
        'content-Type' : "application/json"
    }
  }

  let res = http.post('http://localhost:50012/v1/user/login',payload,param); // Update with your API endpoint
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  errorRate.add(res.status >= 400)

  sleep(1);
}        