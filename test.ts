import axios from 'axios';

(async () => {
  const res = await axios.get('https://comment.bilibili.com/38442945.xml');
  console.log(res.data);
})().catch(e => {
  console.error(e);
});
