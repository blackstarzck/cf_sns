import { join } from "path";

//  서버 프로젝트의 루트 폴더
export const PROJECT_ROOT_PATH = process.cwd(); // Current Working Directory, 현재 서버를 실행한 폴더의 경로입니다.

// 외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_FOLDER_NAME = 'public';

// 포스트 이미지들을 저장할 폴더 이름
export const POST_FOLDER_NAME ='posts';

// 임시폴더 이름
export const TEMP_FOLDER_NAME = 'temp';

// {프로젝트 경로}/public
// join 함수는 경로를 만들어주는 함수입니다. 예를 들어 join('a', 'b', 'c') 는 'a/b/c' 를 반환합니다.
export const PUBLIC_FOLDER_PATH = join(
    PROJECT_ROOT_PATH,
    PUBLIC_FOLDER_NAME
);

// {프로젝트 경로}/public/posts
export const POST_IMAGE_PATH = join(
    PUBLIC_FOLDER_PATH,
    POST_FOLDER_NAME
);

// 클라이언트에서 접근할때는 절대경로 X
// 예: /public/posts/xxx.jpg
export const POST_PUBLIC_IMAGE_PATH = join(
    PUBLIC_FOLDER_PATH,
    POST_FOLDER_NAME
)

// {프로젝트 경로}/temp
export const TEMP_FOLDER_PATH = join(
    PUBLIC_FOLDER_PATH,
    TEMP_FOLDER_NAME
);