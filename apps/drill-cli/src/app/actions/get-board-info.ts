import { Program } from '@heavy-duty/anchor';
import { Octokit } from '@octokit/rest';
import { getBoard, getBoardVault } from '../state';
import { Drill } from '../utils/drill';

interface BoardDataInfo {
  owner: string;
  repoName: string;
}

export const getBoardInfo = async (
  program: Program<Drill>,
  boardData: BoardDataInfo
) => {
  const octokit = new Octokit();
  const { owner, repoName } = boardData;
  const repo = await octokit.rest.repos.get({ owner, repo: repoName });
  const boardId = repo.data.id;
  const board = await getBoard(program, boardId);
  if (board === null) {
    throw new Error('Board not found');
  }

  const boardVault = await getBoardVault(program, boardId);

  return {
    boardId,
    boardVault,
    board,
  };
};
