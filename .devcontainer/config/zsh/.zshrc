# Enable Powerlevel10k instant prompt (should stay at the top)
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Path to Oh My Zsh installation
export ZSH="$HOME/.oh-my-zsh"

# Theme
ZSH_THEME="powerlevel10k/powerlevel10k"

# Plugins (fzf loaded separately after Oh My Zsh to avoid instant prompt warnings)
plugins=(
    git
    docker
    docker-compose
    npm
    node
    sudo
    history
    dirhistory
    colored-man-pages
    command-not-found
    zsh-autosuggestions
    zsh-syntax-highlighting
    zsh-completions
    zsh-history-substring-search
)

# Plugin settings
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#666666"
ZSH_AUTOSUGGEST_STRATEGY=(history completion)

# Load completions
autoload -U compinit && compinit

# Source Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Load fzf (installed from GitHub with full shell integration)
# Add fzf to PATH first to ensure the newer version is used
export PATH="$HOME/.fzf/bin:$PATH"
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# User configuration

# Preferred editor
export EDITOR='nano'

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias cls='clear'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'

# Git aliases (additional to oh-my-zsh git plugin)
alias gs='git status'
alias gd='git diff'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias glog='git log --oneline --graph --decorate'

# Bun aliases (for devcontainer)
alias bi='bun install'
alias br='bun run'
alias bt='bun test'
alias bd='bun run dev'

# History settings
HISTSIZE=10000
SAVEHIST=10000
setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE

# Key bindings for history substring search
bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down

# fzf configuration (customizes appearance and behavior)
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'

# Set default fzf command if fd or ripgrep is available
if command -v fd &> /dev/null; then
  export FZF_DEFAULT_COMMAND='fd --type f --hidden --exclude .git'
elif command -v rg &> /dev/null; then
  export FZF_DEFAULT_COMMAND='rg --files --hidden --glob "!.git/*"'
fi

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
