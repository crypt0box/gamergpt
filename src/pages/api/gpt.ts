// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

export type Review = {
  negatives: string[];
  positives: string[];
};

const extractStrings = (inputStr: string): Review => {
  const positives: string[] = [];
  const negatives: string[] = [];
  const inputLines = inputStr.split("\n");

  for (const line of inputLines) {
    if (line.trim().startsWith("p")) {
      const matched = line.match(/p\d+.\s*(.*)/);
      if (matched) {
        positives.push(matched[1]);
      }
    } else if (line.trim().startsWith("n")) {
      const matched = line.match(/n\d+.\s*(.*)/);
      if (matched) {
        negatives.push(matched[1]);
      }
    }
  }

  return { positives, negatives };
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const messages = {
  role: "system",
  content: `
  これから渡す文章をネガティブな意見とポジティブな意見に分けてそれぞれ最大5つまで要約してください。
  ポジティブな意見の先頭には「p」を、ネガティブな意見の先頭には「n」をつけてください。
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

    // GPTくんにお願い
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [messages, { role: "user", content: review }],
      temperature: 0.2,
    });
    const answer = `${completion.data.choices[0].message?.content.trim()}\r\n`;

    // ChatGPTからの返答をパースしてJSON形式に変換
    const answerJson = extractStrings(answer);
    res.status(200).json({ answer: answerJson });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
p1: 作り込まれた奥深いストーリーに度肝を抜かれる。
p2: PS5のDualsenseにも対応して楽しめる。
p3: 安くなっているので値段以上のものを得られる。
p4: レイトレーシングによるエフェクトが美しい。

n1: バグが多く、不安定な動作がある。
n2: FS2が効果がわかりづらい。
n3: ハイエンドカードが必要でパフォーマンスが重い。
 */
