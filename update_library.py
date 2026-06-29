import json
import re
import requests

USERNAME = "mohammed1920"
INDEX_FILE = "index.html"

def get_law_books():
    books = []
    url = f"https://api.github.com/users/{USERNAME}/repos?sort=updated&per_page=100"
    response = requests.get(url)
    if response.status_code != 200:
        print("فشل في جلب المستودعات")
        return books
    
    repos = response.json()
    law_repos = [repo for repo in repos if repo['name'].lower().startswith('law-')]
    
    for repo in law_repos:
        repo_name = repo['name']
        ch_count = 0
        contents_url = f"https://api.github.com/repos/{USERNAME}/{repo_name}/contents/"
        contents_resp = requests.get(contents_url)
        if contents_resp.status_code == 200:
            files = contents_resp.json()
            ch_count = sum(1 for f in files if f['name'].lower().startswith('ch') and f['name'].endswith('.html'))
            
        description = repo.get('description') or "كتاب قانوني | مستشار قانوني"
        if "|" in description:
            parts = description.split("|")
            title = parts[0].strip()
            author = parts[1].strip()
        else:
            title = description.strip()
            author = "مستشار قانوني"
            
        books.append({
            "repo": repo_name,
            "title": title,
            "author": author,
            "chapters": ch_count
        })
    return books

def update_index_html(books):
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    books_json = json.dumps(books, ensure_ascii=False, indent=4)
    pattern = r"(const\s+BOOKS\s*=\s*\[).*?(\];)"
    replacement = f"const BOOKS = {books_json};"
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("تم تحديث ملف index.html بنجاح ومبروك الأتمتة السريعة!")

if __name__ == "__main__":
    books_list = get_law_books()
    if books_list:
        update_index_html(books_list)
