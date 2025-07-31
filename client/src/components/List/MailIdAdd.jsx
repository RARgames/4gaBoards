/* global navigator */
import mailsApi from '../../api/mails';
import { getAccessToken } from '../../utils/access-token-storage';

async function addMailId({ listId }) {
  const headers = {
    Authorization: `Bearer ${getAccessToken()}`,
  };

  try {
    const res = await mailsApi.updateMail(listId, headers);
    const { mailId } = res.item;
    await navigator.clipboard.writeText(mailId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    try {
      const res = await mailsApi.createMail(listId, headers);
      const { mailId } = res.item;
      await navigator.clipboard.writeText(mailId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}

export default addMailId;
