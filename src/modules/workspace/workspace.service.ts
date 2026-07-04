import { v7 as uuid } from "uuid";
import { CreateProjectBody, JoinProjectBody } from "./workspace.validation";
import { insertProject } from "./workspace.repository";


const generateProjectCode = (length: number = 6): string => {
  let code = "";
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * LETTERS.length);
    code += LETTERS[randomIndex];
  }

  return code;
};

const isUniqueConstraintError = (
  error: unknown,
  columnName: string,
): boolean => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "detail" in error
  ) {
    const dbError = error as { code?: string; detail?: string };

    return (
      dbError.code === "23505" &&
      dbError.detail?.includes(`(${columnName})`) === true
    );
  }

  return false;
};

export const createProject = async (body: CreateProjectBody, managerId: string) => {

  const projectId = uuid();

  const projectData = {
    id: projectId,
    name: body.name,
    description: body.description,
    managerId,
  };

  while(true){
    const code = generateProjectCode();

    try{
        return await insertProject({
            ...projectData,
            joinCode: code,
        });
    }catch(error) {
        if(isUniqueConstraintError(error, "join_code")){
            continue;
        }
        throw error;
    }
  }


};

export const joinProject = async(body: JoinProjectBody) => {
    
}