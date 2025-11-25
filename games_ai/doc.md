# install

brew update
brew upgrade

pip3 --version
pip 21.2.4 from /Applications/Xcode.app/Contents/Developer/Library/Frameworks/Python3.framework/Versions/3.9/lib/python3.9/site-packages/pip (python 3.9)

- pip3 install mlx

# logs

==> node@20
node@20 is keg-only, which means it was not symlinked into /opt/homebrew,
because this is an alternate version of another formula.

If you need to have node@20 first in your PATH, run:
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> /Users/pedrodarma/.zshrc

For compilers to find node@20 you may need to set:
export LDFLAGS="-L/opt/homebrew/opt/node@20/lib"
export CPPFLAGS="-I/opt/homebrew/opt/node@20/include"
==> ruby
By default, binaries installed by gem will be placed into:
/opt/homebrew/lib/ruby/gems/3.4.0/bin

You may want to add this to your PATH.

ruby is keg-only, which means it was not symlinked into /opt/homebrew,
because macOS already provides this software and installing another version in
parallel can cause all kinds of trouble.

If you need to have ruby first in your PATH, run:
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> /Users/pedrodarma/.zshrc

For compilers to find ruby you may need to set:
export LDFLAGS="-L/opt/homebrew/opt/ruby/lib"
export CPPFLAGS="-I/opt/homebrew/opt/ruby/include"
pedrodarma@Mini-Mini-Darma games-api %
