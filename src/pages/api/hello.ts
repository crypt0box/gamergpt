// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

type Review = {
  negative: string[];
  positive: string[];
};

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const messages = {
  role: "system",
  content: `
  次に渡す文章をネガティブな意見とポジティブな意見に分けてそれぞれ最大５つまで以下のようにjson形式で要約してください

  {
    negative: [],
    positive: []
  }
  `,
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ answer: Review } | { error: string }>
) {
  try {
    const params: { gameId: string } = req.body;

    // gameIdがリクエストに存在しない場合
    if (!params.gameId) {
      res.status(400).json({ error: "Bad request" });
      return;
    }

    // gameIdからsteamのレビューを取得する
    const { data } = await axios.get(
      `https://store.steampowered.com/appreviews/${params.gameId}?json=1&language=japanese&day_range=365`
    );

    // レビューを抜き出す
    const review: string = data.reviews
      .map((el: any) => el.review.replace(/\s+/g, ""))
      .join()
      // tokenはmax4096なので3000文字に切り出す
      .slice(0, 3000);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [messages, { role: "user", content: review }],
    });
    const answer = `${completion.data.choices[0].message?.content.trim()}\r\n`;

    console.log("🚀 ~ file: hello.ts:57 ~ answer:", answer);
    // ChatGPTからの返答をパースしてJSON形式に変換
    // FIXME: jsonのパースに失敗する
    const answerJson = JSON.parse(answer);
    res.status(200).json({ answer: answerJson });
    // let answerJson: Review;
    // try {
    //   answerJson = JSON.parse(answer);
    //   res.status(200).json({ answer: answerJson });
    // } catch (error) {
    //   res.status(500).json({
    //     error: "Internal server error",
    //   });
    //   return;
    // }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
