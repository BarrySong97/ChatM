/* generated using openapi-typescript-codegen -- do no edit */ /* istanbul ignore file */ /* tslint:disable */ /* eslint-disable */ import { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import {
  BudgetData,
  Criteria,
  FileListIndexData,
  Paper,
  PaperProcessingData,
  RunStatus,
} from "../models/ProjectFileList";

export class FileListService {
  /**
   *
   * @param params 创建列
   * @returns
   */
  public static createCriteriaOrQuestion(params: {
    label: string;
    details: string;
    projectId: number;
    moduleId: number;
    category: "common" | "specific" | "none";
    type: "criteria" | "question";
  }): CancelablePromise<{
    column: {
      id: number;
      index: number;
      details: string;
      label: string;
      category: "common" | "specific" | "none";
      type: "criteria" | "question";
    }[];
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/column/create",
      query: {
        label: params.label,
        details: params.details,
        category: params.category,
        type: params.type,
      },
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
    });
  }
  /**
   *
   * @param params 编辑列
   * @returns
   */
  public static editCriteriaOrQuestion(params: {
    id: number;
    shortName: string;
    fullName: string;
    projectId: number;
    moduleId: number;
    category: "common" | "specific" | "none";
    type: "criteria" | "question";
  }): CancelablePromise<{
    column: {
      id: number;
      shortName: string;
      fullName: string;
      category: "common" | "specific" | "none";
      type: "criteria" | "question";
    };
  }> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/projects/{projectId}/modules/{moduleId}/main/colunm/edit",
      query: {
        id: params.id,
        shortName: params.shortName,
        fullName: params.fullName,
        category: params.category,
        type: params.type,
      },
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
    });
  }
  /**
   *
   * @param params  删除列
   * @returns
   */
  public static deleteCriteriaOrQuestion(params: {
    id: number;
    projectId: number;
    moduleId: number;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/projects/{projectId}/modules/{moduleId}/main/colunm/delete",
      query: {
        id: params.id,
      },
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
    });
  }
  /**
   * 修改列
   *
   *  */
  public static changeCriteriaOrQuestion(params: {
    id: number;
    projectId: number;
    moduleId: number;
    label: string;
    details: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/colunm/edit",
      query: {
        id: params.id,
        label: params.label,
        details: params.details,
      },
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
    });
  }

  /**
   * 获取模块内容
   */
  public static getModule(params: {
    projectId: number;
    moduleId: number;
  }): CancelablePromise<
    {
      criteria: Criteria[];
      papers: Paper[];
    } & FileListIndexData
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/user/project/{projectId}/module/{moduleId}/contents",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      query: {
        sessionId: window.localStorage.getItem(
          `sessionId-${params.moduleId}-${params.projectId}`
        ),
      },
    });
  }

  /**
   *    查看处理进度
   */
  public static getProgress(params: {
    projectId: number;
    moduleId: number;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/projects/{projectId}/modules/{moduleId}/main/checkProgress/",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
    });
  }

  /**
   *
   * @param params 运行模型
   * @returns
   */
  public static run(params: {
    projectId: number;
    moduleId: number;
    criteriaId?: number[];
    paperId?: number[];
  }): CancelablePromise<{ session: number }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/run",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      body: {
        criteriaId: params.criteriaId,
        paperId: params.paperId,
      },
    });
  }

  /**
   * 用户决定
   */
  public static userDecide(params: {
    projectId: number;
    moduleId: number;
    selectResult?: "yes" | "no" | "maybe" | "cancel";
    paperId?: number;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/userLabel",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      query: {
        selectResult: params.selectResult,
        paperId: params.paperId,
      },
    });
  }

  /**
   * 查看criteria结果分布
   *
   */
  public static getCriteriaResult(params: {
    projectId: number;
    moduleId: number;
    index?: string;
  }): CancelablePromise<{ criteria: PaperProcessingData[] }> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/projects/{projectId}/modules/{moduleId}/main/checkCriteriaDistribution/",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      query: {
        index: params.index ?? "total",
        sessionId: window.localStorage.getItem(
          `sessionId-${params.moduleId}-${params.projectId}`
        ),
      },
    });
  }

  /**
   * 价格估计
   */
  public static estimatePrice(params: {
    projectId: number;
    moduleId: number;
    criteria_id?: number[];
    paper_id?: number[];
  }): CancelablePromise<BudgetData> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/priceEstimated/",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      body: {
        criteria_id: params.criteria_id,
        paper_id: params.paper_id,
      },
      query: {
        sessionId: window.localStorage.getItem(
          `sessionId-${params.moduleId}-${params.projectId}`
        ),
      },
    });
  }

  /**
   * 查看运行进度
   */
  public static getRunProgress(params: {
    projectId: number;
    moduleId: number;
    sessionId: number;
  }): CancelablePromise<RunStatus> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/projects/{projectId}/modules/{moduleId}/main/checkProgress/",
      query: {
        sessionId: window.localStorage.getItem(
          `sessionId-${params.moduleId}.${params.projectId}`
        ),
      },
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
    });
  }

  /**
   * Module3回答转换规则，在 启动模型 前执行装换跪
   */
  public static convert(params: {
    projectId: number;
    moduleId: number;
    body: { id: number; rule: string }[];
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/conversionRule",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      body: params.body,
    });
  }

  /**
   * 选择rob工具，只上传rob工具的index
   */

  public static selectRobTool(params: {
    projectId: number;
    moduleId: number;
    rob_Id: number;
  }): CancelablePromise<{
    selected_rob: number;
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/biasTool",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
      query: {
        rob_Id: params.rob_Id,
      },
    });
  }
  /**
   * 导出文件
   */
  public static exportFile(params: {
    projectId: number;
    moduleId: number;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/projects/{projectId}/modules/{moduleId}/main/export",
      path: {
        projectId: params.projectId,
        moduleId: params.moduleId,
      },
    });
  }
}
