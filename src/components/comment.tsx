import { getLocalUser } from "@/shared/storage";
import { withCache } from "@/utils/cache";
import * as React from "jsx-dom";
import { Octokit } from "octokit";
import { config } from "urodele.config";

export const mount = async (selector: string) => {
  const id = location.pathname.replace("/post/", "");
  const localUser = getLocalUser();
  const oc = new Octokit({ auth: localUser?.token });
  const root = document.querySelector(selector);
  const { login, repo } = config.github;
  if (!root) return;
  const title = `comment-${id}`;
  const { issue: xs, comments } = await (async () => {
    const fn = withCache(
      async () => {
        const { data: issues } = await oc.request("GET /repos/{owner}/{repo}/issues", {
          owner: login,
          repo: repo,
        });
        const iss = issues.find((s) => s.title === title);
        if (!iss)
          return {
            issue: iss,
            comments: [],
          };
        const { data } = await oc.request("GET /repos/{owner}/{repo}/issues/{issue_number}/comments", {
          owner: login,
          repo: repo,
          issue_number: iss?.number,
        });
        return {
          issue: iss,
          comments: data,
        };
      },
      `fetch-${JSON.stringify({
        owner: login,
        repo: repo,
        title,
      })}`,
      { expires: localUser ? 10 * 1000 : 5 * 60 * 1000 }
    );
    const res = await fn();
    return res;
  })();
  if (xs) {
    comments.unshift({
      ...(xs as any),
    });
  }

  console.log(id, "id", comments);
  const Comment = () => {
    return (
      <div class="w-full p-2 bg-[#f7ebd9] dark:bg-[#8f6e3e] flex flex-col gap-4 rounded">
        <div class="text-sm opacity-60">Comments:</div>
        {comments.map((comment) => (
          <a href={comment.html_url} class="flex w-full gap-2" target="_blank">
            <img
              src={comment.user?.avatar_url}
              width={24}
              height={24}
              class="w-6 h-6 rounded-full object-cover"
              alt=""
            />
            <div class="flex-1 flex flex-col gap-2">
              <div class="text-sm">{comment.user?.name ?? comment.user?.login}</div>
              <div>{comment.body_html ?? comment.body}</div>
            </div>
          </a>
        ))}
        <div class="flex justify-center">
          <a
            class="text-button text-sm bg-green-400 dark:bg-green-800"
            href={xs ? xs.html_url : `https://github.com/${login}/${repo}/issues/new?title=${title}`}
            target="_blank">
            Leave Comment
          </a>
        </div>
      </div>
    );
  };

  root.replaceChildren(Comment());
};
