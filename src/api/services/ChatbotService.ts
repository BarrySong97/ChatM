/* generated using openapi-typescript-codegen -- do no edit */ /* istanbul ignore file */ /* tslint:disable */ /* eslint-disable */ import { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { Message } from "../models/Chat";

export class ChatService {
  /**
   *
   * @param params 聊天接口
   * @returns
   */
  public static chat(params: {
    message: string;
    projectId: number;
    moduleId: number;
  }): CancelablePromise<ChatMessageItem> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/chatbot/chat",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      query: {
        user_msg: params.message,
      },
    });
  }

  /**
   * 删除上传文件
   */
  public static deleteFile(params: {
    id: number;
    moduleId: number;
    projectId: number;
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/projects/{projectId}/modules/{moduleId}/chatbot/upload",
      path: {
        moduleId: params.moduleId,
        projectId: params.projectId,
      },
      query: {
        fileId: params.id,
      },
    });
  }

  /**
   * 上传criteria/question
   * @param params chatbot结束对话后执行
   */
  public static uploadChat(params: {
    moduleId: number;
    projectId: number;
    criteria?: Criteria[];
  }) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/chatbot/criteria/upload",
      path: {
        moduleId: params.moduleId,
        projectId: params.projectId,
      },
      body: params.criteria,
    });
  }

  /**
   * 获取chatbot信息
   */
  public static getChatbotInfo(params: {
    moduleId: number;
    projectId: number;
  }): CancelablePromise<{ chat: Message[] }> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/user/project/{projectId}/modules/{moduleId}/chatbot/history_chat",
      path: {
        moduleId: params.moduleId,
        projectId: params.projectId,
      },
    });
  }
}
