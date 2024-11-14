import { hc, InferResponseType } from "hono/client";
import { notFound } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";

import type {
  ApiRoutes,
  ErrorResponse,
  Order,
  SortBy,
  SuccessResponse
} from "@/share/types";
import { resolve } from "bun";

const client = hc<ApiRoutes>("/", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
}).api;


export const userSignup = async (username: string, password: string) => {
  try {
    const res = await client.auth.signup.$post({
      form: {
        username,
        password,
      },
    });
    if (res.ok) {
      const data = (await res.json()) as SuccessResponse;
      return data;
    }
    const data = (await res.json()) as unknown as ErrorResponse;
    return data;
  } catch (e) {
    return {
      success: false,
      message: String(e),
      isFormError: false,
    } as ErrorResponse;
  }
};

export const userLogin = async (username: string, password: string) => {
  try {
    const res = await client.auth.login.$post({
      form: {
        username,
        password,
      },
    });
    if (res.ok) {
      const data = (await res.json()) as SuccessResponse;
      return data;
    }
    const data = (await res.json()) as unknown as ErrorResponse;
    return data;
  } catch (e) {
    return {
      success: false,
      message: String(e),
      isFormError: false,
    } as ErrorResponse;
  }
};

export const getUser = async () => {
  const res = await client.auth.user.$get();
  if (res.ok) {
    const data = await res.json();
    return data.data.username;
  }
  return null;
};

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: Infinity,
  });

export type GetPostsSuccess = InferResponseType<typeof client.posts.$get>;
export const getPosts = async ({
  pageParam = 1,
  pagination,
}: {
  pageParam: number;
  pagination: {
    sortBy?: SortBy;
    order?: Order;
    author?: string;
    site?: string;
  };
}) => {
  const res = await client.posts.$get({
    query: {
      page: pageParam.toString(),
      sortBy: pagination.sortBy,
      order: pagination.order,
      author: pagination.author,
      site: pagination.site,
    },
  });
  if (!res.ok) {
    const data = (await res.json()) as unknown as ErrorResponse;
    throw new Error(data.message);
  }
  const data = await res.json();
  return data;
};


export async function upvotePost(id: string) {
  const res = await client.posts[":id"].upvote.$post({
    param: {
      id,
    },
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  }
  const data = (await res.json()) as unknown as ErrorResponse;
  throw new Error(data.message);
}

export const postSubmit = async (
  title: string,
  url: string,
  content: string,
) => {
  try {
    const res = await client.posts.$post({
      form: {
        title,
        url,
        content,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    const data = (await res.json()) as unknown as ErrorResponse;
    return data;
  } catch (e) {
    return {
      success: false,
      message: String(e),
      isFormError: false,
    } as ErrorResponse;
  }
};

export const getPost = async (id: number) => {
  const res = await client.posts[":id"].$get({
    param: {
      id: id.toString(),
    },
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    if (res.status === 404) {
      throw notFound();
    }
    const data = (await res.json()) as unknown as ErrorResponse;
    throw new Error(data.message);
  }
};

export async function getComments(
  id: number,
  page: number = 1,
  limit: number = 10,
  pagination: {
    sortBy?: SortBy;
    order?: Order;
  },
) {
  const res = await client.posts[":id"].comments.$get({
    param: {
      id: id.toString(),
    },
    query: {
      page: page.toString(),
      limit: limit.toString(),
      includeChildren: "true",
      sortBy: pagination.sortBy,
      order: pagination.order,
    },
  });

  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const data = (await res.json()) as unknown as ErrorResponse;
    throw new Error(data.message);
  }
}

export async function getCommentComments(
  id: number,
  page: number = 1,
  limit: number = 2,
) {
  const res = await client.comments[":id"].comments.$get({
    param: {
      id: id.toString(),
    },
    query: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const data = (await res.json()) as unknown as ErrorResponse;
    throw new Error(data.message);
  }
}

export async function upvoteComment(id: string) {
  const res = await client.comments[":id"].upvote.$post({
    param: {
      id,
    },
  });
  if (res.ok) {
    return await res.json();
  }
  const data = (await res.json()) as unknown as ErrorResponse;
  throw Error(data.message);
}

export async function postComment(
  id: number,
  content: string,
  isNested?: boolean,
) {
  try {
    const res = isNested
      ? await client.comments[":id"].$post({
        form: {
          content,
        },
        param: {
          id: id.toString(),
        },
      })
      : await client.posts[":id"].comment.$post({
        form: {
          content,
        },
        param: {
          id: id.toString(),
        },
      });

    if (res.ok) {
      return await res.json();
    }
    const data = (await res.json()) as unknown as ErrorResponse;
    return data;
  } catch (e) {
    return {
      success: false,
      message: String(e),
      isFormError: false,
    } as ErrorResponse;
  }
}