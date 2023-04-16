// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const params: { gameId: string } = req.body;
  const { data } = await axios.get(
    `https://store.steampowered.com/appreviews/${params.gameId}?json=1&language=japanese&day_range=365`
  );
  const review: string = data.reviews
    .map((el: any) => el.review.replace(/\s+/g, ""))
    .join();

  res.status(200).json({ name: "John Doe" });
}
