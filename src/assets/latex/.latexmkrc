$default_files = ['main.tex'];

$pdf_mode = 4;

$aux_dir = 'latex-tmp';

use File::Path qw(make_path);
make_path("$aux_dir/songs");