export const API_BASE = 'http://localhost:3001';

export function resolveImageUrl(path, type = 'build') {
  const defaultBuildImage = "/default-car.jpg";
  const defaultAvatarImage = "/default-avatar.jpg";

  if (!path) {
    return type === 'avatar' ? defaultAvatarImage : defaultBuildImage;
  }

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image')) {
    return path;
  }

  if (path.startsWith('/uploads/')) { //case 1: path from db is correctly prefixed
    return `${API_BASE}${path}`;
  }

  if (type === 'build' || type === 'avatar') {
    if (path.startsWith('/')) { //case 2: e.g., "/filename.jpg"
      return `${API_BASE}/uploads${path}`; // path already includes the leading slash
    } else { //case 3: e.g., "filename.jpg"
      return `${API_BASE}/uploads/${path}`;
    }
  }

  if (path === defaultAvatarImage || path === defaultBuildImage) {
    return path;
  }

  console.warn(`[resolveImageUrl] Unexpected path format: ${path}, type: ${type}. Falling back to default.`);
  return type === 'avatar' ? defaultAvatarImage : defaultBuildImage;

}