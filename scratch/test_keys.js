const https = require("https");

const keys = [
  'AIzaSyAP-jjEJBzmIyKR4F-3XITp8yM9T1gEEI8',
  'AIzaSyDovLKo3djdRbs963vqKdbj-geRWyzMTrg',
  'AIzaSyD_InbmSFufIEps5UAt2NmB_3LvBH3Sz_8',
  'AIzaSyAlpy4kDC13CDmwQCqYR7-JihW1XXz9vw8',
  'AIzaSyBwQcjgmXUAsw5r4FZXO5t8_EZ_aUm_TGE',
  'AIzaSyDQ3Ijz7kHvcqF6KcNLJZCnpLODa1nnkj0',
  'AIzaSyCbsbvGCe7C9mCtdaTycZB2eUFuzsYKG_E',
  'AIzaSyBTTKxYeo_VMScZyYaHH8-9ECtZclpTqrk',
  'AIzaSyBGb5fGAyC-pRcRU6MUHb__b_vKha71HRE',
  'AIzaSyC-ZHwKiKTHrerA8sAZBW_gzJ2U5vPAFyY',
  'AIzaSyAwpXCTyJFWdTtqX4WgaGT18Gs_LCY2iTA',
  'AIzaSyABqJ85_R2irnKzMtGBL0iHuyFBi6Efk1w',
  'AIzaSyDPU3TWHmg0FmLJIrGonio1GD6KQVrPRz4',
  'AIzaSyCJkDKMvUTr9oj5cYVr8OHRutT6pyw4--U',
  'AIzaSyBpa8DlAVbnBsgTphEHO_YL7uokzq4vqns',
  'AIzaSyBxwfyzC4aIwGUHrp2dMR4-3oxCDQ4u19c',
  'AIzaSyA7iZFc-PwwePXwuJqZgG8RqRqR95wsofg',
  'AIzaSyDhjcmUX87_gjbJZTCbka3yxmG7_265wtU',
  'AIzaSyD8UdE_EruehS10c9NGvoO6bVaoesjWgZs',
  'AIzaSyCuiBH00W__Ir06KUt1N8PkTyYulqE5NSA',
  'AIzaSyC8OUdzPYLrdWDeNMJ4tjxEhtYUQDljqTg',
  'AIzaSyCIGHYEdm91p31HKyJSoU4at7IqhCViXuA',
  'AIzaSyAAMjYtQqHgaReEFNaiZssJAz1MCRqvNdA',
  'AIzaSyBs4M8MW-9jrQUbgjuDZPqYs9zSI5aWshw',
  'AIzaSyCx80ru6-RXeTi3GvqkFsMVyMf-vpgIoVw',
  'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
  'AIzaSyDZNkyC-AtROwMBpLfevIvqYk-Gfi8ZOeo',
  'AIzaSyDophAQuyyiBr8h0nypEwXUKozH-BEswD0',
  'AIzaSyBU2xE_JHvB6wag3tMfhxXpg2Q_W8xnM-I',
  'AIzaSyDVDUqts7CooOWu_Yyc_8s4f8Ywc-Oj9H4',
  'AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw',
  'AIzaSyB-5OLKTx2iU5mko18DfdwK5611JIjbUhE',
  'AIzaSyB6xiKGDR5O3Ak2okS4rLkauxGUG7XP0hg',
  'AIzaSyAQk0fBONSGUqCNznf6Krs82Ap1-NV6J4o',
  'AIzaSyCCxcqdrZ_7QMeLCRY20bh_SXdAYqy70KY',
  'AIzaSyBLEMok-5suZ67qRPzx0qUtbnLmyT_kCVE',
  'AIzaSyCM4QpTRSqP5qI4Dvjt4OAScIN8sOUlO-k',
  'AIzaSyCg-ZUslalsEbXMfIo9ZP8qufZgo3LSBDU',
  'AIzaSyDxT0vkxnY_KeINtA4LSePJO-4MAZPMRsE',
  'AIzaSyBQom12tzI-rybN7Sf-KfeL4nwm-Rf7PmI',
  'AIzaSyDtMB89gyutGObyfQggx9OOfjS0QWFYpFc',
  'AIzaSyDVQw45DwoYh632gvsP5vPDqEKvb-Ywnb8',
  'AIzaSyCDPcz68z1ZGJA8IVimM9m5AvP64-gbfiA',
  'AIzaSyDu8HBaCrEugFf8UXAM1tsQBEzc0cm5VV0',
  'AIzaSyDGdNt7X8fyTgiZ3aV4ilBbyTjs44q6vGA',
  'AIzaSyDh5dSttC9Qo-sTLq8IaVOzOxaQNNlNjWc',
  'AIzaSyCIMH2ks6VPAfRC2lqU_Snz1Lo76XGdnlc',
  'AIzaSyAkMKyx1wRBYBBlFz5lv_AmZ0mtN_b9tTc',
  'AIzaSyA_xBFGD4W6UfK1v9vrg4tdMmYNGB-Nhzg',
  'AIzaSyBKIz7G63yc17ys7QMmm8jxSMAlOCgbhjM',
  'AIzaSyC4fg9bTzOQwMZ6ro7UhcO9nTI6ISEaYFw',
  'AIzaSyCcL4rc-DwD_Ackxfew0W6dmgbYyaMfHwA',
  'AIzaSyDvRWqOhT9E7rFkftrw8sbP8sooqvxGyH4',
  'AIzaSyCOYnWLBzXGbFcVe2Ij_qtwJxvwbUE0Iuc',
  'AIzaSyAm-tuk-bOdhd4rGbHQCM2GPkqaUCZN-yc',
  'AIzaSyAWGrfCCr7albM3lmCc937gx4uIphbpeKQ'
];

function checkKey(apiKey) {
  return new Promise((resolve) => {
    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${apiKey}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ apiKey, status: res.statusCode, json });
        } catch {
          resolve({ apiKey, status: res.statusCode, data });
        }
      });
    }).on("error", (err) => {
      resolve({ apiKey, error: err.message });
    });
  });
}

async function run() {
  console.log(`Checking ${keys.length} keys against Google Identity Toolkit...`);
  for (const k of keys) {
    const res = await checkKey(k);
    if (res.json && res.json.projectId) {
      console.log(`\n*** MATCH: Key ${k} belongs to projectId: ${res.json.projectId} ***`);
      console.log("Full config response:", JSON.stringify(res.json, null, 2));
    }
  }
  console.log("Done checking keys.");
}

run();
