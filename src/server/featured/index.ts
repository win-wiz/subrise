import { db } from "../db";
import { subreddit, subredditLang, subriseFeatured } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
export async function getSubredditFeaturedList (language: string) {

  return await db
    .select()
    .from(subriseFeatured)
    .where(eq(subriseFeatured.language, language))
    .execute();
} 

export async function getSubredditFeaturedDetail({language, featuredUrl}: {language: string, featuredUrl: string}) {
  const featuredDetail = await db
    .select({
      name: subriseFeatured.name,
      description: subriseFeatured.description,
      promotion: subriseFeatured.promotion,
      featuredUrl: subriseFeatured.featuredUrl,
      subredditId: subriseFeatured.subredditId,
    })
    .from(subriseFeatured)
    .where(and(eq(subriseFeatured.language, language), eq(subriseFeatured.featuredUrl, featuredUrl)))
    .execute();

  const {subredditId} = featuredDetail[0]
  // const subredditDetail = await getSubredditByName(subredditId, language)
  // console.log(subredditId);
  let redditIds = subredditId.split(',');
  // console.log(redditIds);
  const reasons = await db
    .select({
      id: subreddit.id,
      name: subreddit.name,
      rank: subreddit.rank,
      iconUrl: subreddit.iconUrl,
      subscribersCount: subreddit.subscribersCount,
      href: subreddit.href,
      featuredReason: subredditLang.featuredReason,
      category: subredditLang.category,
      description: subredditLang.description,
    })
    .from(subreddit)
    .innerJoin(subredditLang, eq(subreddit.id, subredditLang.subredditId))
    .where(and(eq(subredditLang.language, language), inArray(subreddit.id, redditIds.map(Number))))
    .execute();

  // console.log(reasons);
  return {
    info: featuredDetail[0],
    reasons: reasons
  };
}

export async function getAllSubredditFeatured() {
  return await db
    .select()
    .from(subriseFeatured)
    .execute();
}

export async function getSubredditFeaturedTitleAndDescription({language, slug}: {language: string, slug: string}) {
  return await db
    .select({
      title: subriseFeatured.name,
      description: subriseFeatured.description,
    })
    .from(subriseFeatured)
    .where(and(eq(subriseFeatured.language, language), eq(subriseFeatured.featuredUrl, slug)))
    .execute();
}