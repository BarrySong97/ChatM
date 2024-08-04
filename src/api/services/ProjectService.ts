/* generated using openapi-typescript-codegen -- do no edit */ /* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { Project, Projects } from "../models/Project";

export class ProjectService {
  /**
   *
   * @param query 创建一个项目
   * @returns
   */
  public static createProject(query: {
    projectName: string;
  }): CancelablePromise<{
    project: Project;
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/user/project/create",
      query: query,
    });
  }
  /**
   *
   * @param id 删除项目
   * @returns
   */
  public static deleteProject(id: number): CancelablePromise<{
    project: Project;
  }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/user/project/{projectId}/delete",
      path: {
        projectId: id,
      },
    });
  }
  /**
   *
   * @param id 更新一个项目
   * @param query
   * @returns
   */
  public static updateProject(
    id: number,
    query: {
      projectName: string;
    }
  ): CancelablePromise<{
    project: Project;
  }> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/user/project/{projectId}/update",
      path: {
        projectId: id,
      },
      query: query,
    });
  }

  /**
   * 获取用户的project
   */
  public static getProject(): CancelablePromise<{
    projects: Projects;
  }> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/user/projects",
    });
  }
}
